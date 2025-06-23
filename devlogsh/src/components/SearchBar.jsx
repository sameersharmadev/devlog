import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

let debounceTimer;

const SearchBar = () => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState({ posts: [], users: [] });
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    const fetchSuggestions = async (text) => {
        if (!text) {
            setSuggestions({ posts: [], users: [] });
            return;
        }

        try {
            const res = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/search?q=${encodeURIComponent(text)}`
            );
            const data = await res.json();
            setSuggestions(data);
        } catch (err) {
            console.error('Failed to fetch suggestions:', err);
        }
    };

    useEffect(() => {
        if (debounceTimer) clearTimeout(debounceTimer);

        debounceTimer = setTimeout(() => {
            fetchSuggestions(query);
            setShowDropdown(true);
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [query]);

    const handleSelect = (type, item) => {
        setShowDropdown(false);
        if (type === 'user') navigate(`/user/${item.id}`);
        else navigate(`/post/${item.slug}`);
    };

    return (
        <div className="relative w-full md:w-xs">
            <div className="relative w-full">
                {/* Search Icon inside input */}
                <Search
                    size={16}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none"
                />
                <input
                    type="text"
                    placeholder="Search posts or users..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query && setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                    className="w-full bg-transparent border-0 border-b border-gray-400 dark:border-gray-500 outline-none pl-9 pr-3 py-2 text-sm dark:bg-darkBg"
                />
            </div>

            {showDropdown && query.trim() && (
                <div className="absolute left-0 right-0 top-12 bg-lightBg dark:bg-darkBg rounded shadow-md z-50 p-2 text-sm max-h-64 overflow-y-auto custom-scrollbar">
                    {suggestions.users.length === 0 && suggestions.posts.length === 0 ? (
                        <div className="p-2 text-muted-foreground text-center">
                            No results found. Try something else...
                        </div>
                    ) : (
                        <>
                            {suggestions.users.length > 0 && (
                                <div className="mb-2">
                                    <div className="font-semibold mb-1 text-muted-foreground">Users</div>
                                    {suggestions.users.map((user) => (
                                        <div
                                            key={user.id}
                                            onMouseDown={() => handleSelect('user', user)}
                                            className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer rounded"
                                        >
                                            <img
                                                src={user.avatar_url}
                                                className="w-6 h-6 rounded-full object-cover"
                                                alt="avatar"
                                            />
                                            <span>{user.username}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {suggestions.posts.length > 0 && (
                                <div>
                                    <div className="font-semibold mb-1 text-muted-foreground">Posts</div>
                                    {suggestions.posts.map((post) => (
                                        <div
                                            key={post.id}
                                            onMouseDown={() => handleSelect('post', post)}
                                            className="p-2 hover:bg-muted cursor-pointer rounded"
                                        >
                                            <span>{post.title}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
