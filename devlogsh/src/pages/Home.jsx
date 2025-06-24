import Hero from './home/Hero';
import Featured from './home/Featured';
import TopPostsList from './home/TopPostsList';
import LatestPostsList from './home/LatestPosts';
import Followed from './home/Following';
import SuggestedUsers from '../components/GetSuggestedUsers';
import SectionHeading from '../components/SectionHeading';

import { jwtDecode } from 'jwt-decode';

export default function Home() {
    const token = localStorage.getItem('token');

    let userId = null;
    if (token) {
        try {
            const decoded = jwtDecode(token);
            userId = decoded.userId;
        } catch (err) {
            console.error('Invalid token');
        }
    }

    return (
        <div className="pt-14 space-y-8 max-w-[1300px] mx-auto">
            <Hero />


            <Featured />
            {userId && (
                <>
                <div className="px-4">
                    <SectionHeading>Suggested Users</SectionHeading>
                </div>
                    <SuggestedUsers />
                </>
            )}

            <Followed />
            <TopPostsList />
            <LatestPostsList />
        </div>
    );
}
