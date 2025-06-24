import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton";

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export default function SuggestedUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [followLoadingIds, setFollowLoadingIds] = useState([]);
    const [followingIds, setFollowingIds] = useState(new Set());

    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);

    const sliderRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to see suggestions.');
            setLoading(false);
            return;
        }

        const fetchSuggestions = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/users/suggestions/get`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const data = await res.json();

                if (!res.ok) {
                    setError(data?.error || 'Failed to fetch');
                    setLoading(false);
                    return;
                }

                if (!Array.isArray(data.users)) {
                    setError('Unexpected response format');
                    setLoading(false);
                    return;
                }

                setUsers(data.users);

                const initiallyFollowing = new Set(
                    data.users.filter((u) => u.is_following).map((u) => u.id)
                );
                setFollowingIds(initiallyFollowing);
            } catch (err) {
                setError('Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        fetchSuggestions();
    }, []);

    useEffect(() => {
        const el = sliderRef.current;
        const updateScrollButtons = () => {
            if (!el) return;
            setShowLeft(el.scrollLeft > 10);
            setShowRight(el.scrollLeft + el.offsetWidth < el.scrollWidth - 10);
        };

        updateScrollButtons();
        if (el) el.addEventListener('scroll', updateScrollButtons);
        return () => {
            if (el) el.removeEventListener('scroll', updateScrollButtons);
        };
    }, [users]);

    useEffect(() => {
        const el = sliderRef.current;
        if (el && users.length && window.innerWidth < 768) {
            const firstCard = el.children[0];
            firstCard?.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
        }
    }, [users]);

    const handleFollowToggle = async (userId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in');
            return;
        }

        const isFollowing = followingIds.has(userId);
        setFollowLoadingIds((prev) => [...prev, userId]);

        try {
            const method = isFollowing ? 'DELETE' : 'POST';
            const res = await fetch(`${API_BASE}/api/follow/${userId}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                const errData = await res.json();
                setError(errData.error || 'Failed to update follow status');
                return;
            }

            setFollowingIds((prev) => {
                const updated = new Set(prev);
                if (isFollowing) {
                    updated.delete(userId);
                } else {
                    updated.add(userId);
                }
                return updated;
            });
        } catch (err) {
            setError('Failed to update follow status');
        } finally {
            setFollowLoadingIds((prev) => prev.filter((id) => id !== userId));
        }
    };

    const scrollRight = () => {
        sliderRef.current?.scrollBy({ left: 300, behavior: 'smooth' });
    };

    const scrollLeft = () => {
        sliderRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="w-full max-w-[1300px] mx-auto rounded-lg relative py-6 px-4">
                <div className="flex overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory gap-4 justify-start">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            style={{ scrollSnapAlign: 'center' }}
                            className="snap-center flex-shrink-0 w-[90%] sm:w-[60%] md:w-52 h-64 rounded-lg p-4 flex flex-col items-center bg-[#f4f6f8] dark:bg-[#1e1e1e]"
                        >
                            <Skeleton className="w-20 h-20 rounded-full mb-3" />
                            <Skeleton className="h-4 w-3/4 mb-2 rounded" />
                            <Skeleton className="h-3 w-full mb-1 rounded" />
                            <Skeleton className="h-3 w-5/6 mb-3 rounded" />
                            <div className="flex-grow" />
                            <Skeleton className="h-8 w-full mt-auto rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) return <p className="text-red-500 px-4">{error}</p>;
    if (!users.length) return <p className="px-4">No suggestions available.</p>;

    return (
        <div className="w-full max-w-[1300px] mx-auto rounded-lg relative py-6">
            <div className="relative">
                <div
                    ref={sliderRef}
                    className="flex overflow-x-auto scroll-smooth scrollbar-hide snap-x snap-mandatory gap-4 px-4 justify-start"
                >
                    {users.map((user) => {
                        const isFollowing = followingIds.has(user.id);
                        const loadingFollow = followLoadingIds.includes(user.id);

                        return (
                            <div
                                key={user.id}
                                onClick={() => navigate(`/user/${user.id}`)}
                                style={{ scrollSnapAlign: 'center' }}
                                className="cursor-pointer snap-center flex-shrink-0 w-[90%] sm:w-[60%] md:w-52 h-64 bg-lightCard dark:bg-darkCard rounded-lg shadow-md p-4 flex flex-col items-center hover:shadow-lg transition relative"
                                title={user.username}
                            >
                                <img
                                    src={user.avatar_url || '/default-avatar.png'}
                                    alt={user.username}
                                    className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-accent"
                                />
                                <p className="font-semibold text-center mb-1 truncate w-full">{user.username}</p>
                                <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-3 line-clamp-3 h-[4.5em]">
                                    {user.bio || 'No bio available'}
                                </p>

                                <div className="flex-grow" />

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleFollowToggle(user.id);
                                    }}
                                    disabled={loadingFollow}
                                    className={`mt-auto w-full text-center px-5 py-2 rounded-full text-white transition disabled:opacity-50 ${
                                        loadingFollow
                                            ? 'bg-gray-400 cursor-wait'
                                            : isFollowing
                                            ? 'bg-gray-500 hover:bg-gray-700'
                                            : 'bg-accent hover:opacity-90'
                                    }`}
                                >
                                    {loadingFollow ? 'Please wait' : isFollowing ? 'Unfollow' : 'Follow'}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Gradients */}
                {showLeft && (
                    <div className="pointer-events-none absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-white/80 to-transparent dark:from-[#1e1e1e]/80" />
                )}
                {showRight && (
                    <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white/80 to-transparent dark:from-[#1e1e1e]/80" />
                )}
            </div>

            {/* Scroll Arrows */}
            {showLeft && (
                <button
                    onClick={scrollLeft}
                    aria-label="Scroll left"
                    className="absolute top-1/2 -left-2 -translate-y-1/2 z-10 rounded-full bg-zinc-700 p-2 shadow-lg hover:opacity-90 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            )}
            {showRight && (
                <button
                    onClick={scrollRight}
                    aria-label="Scroll right"
                    className="absolute top-1/2 -right-2 -translate-y-1/2 z-10 rounded-full bg-zinc-700 p-2 shadow-lg hover:opacity-90 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            )}

            {/* Utility styles */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
}
