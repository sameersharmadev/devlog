import Hero from './home/Hero'
import Featured from './home/Featured'
import TopPostsList from './home/TopPostsList'
import LatestPostsList from './home/LatestPosts'
import Followed from './home/Following'

export default function Home() {
    return (
        <>
            <Hero />
            <Featured />
            <Followed />
            <TopPostsList />
            <LatestPostsList />
        </>
    )
}