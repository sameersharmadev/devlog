import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Dashboard() {
  const [viewsPerPost, setViewsPerPost] = useState([]);
  const [totalViews, setTotalViews] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [avgRating, setAvgRating] = useState("0");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAnalytics() {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const [statsRes, meRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!statsRes.ok || !meRes.ok) throw new Error("Fetch error");

        const statsData = await statsRes.json();
        const meData = await meRes.json();

        setTotalViews(statsData.totalViews);
        setPostCount(statsData.postCount);
        setAvgRating(statsData.avgRating);
        setViewsPerPost(statsData.viewsPerPost);
        setUsername(meData.username || "");
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  const firstHalf = viewsPerPost.slice(0, viewsPerPost.length / 2);
  const secondHalf = viewsPerPost.slice(viewsPerPost.length / 2);
  const sumFirst = firstHalf.reduce((acc, v) => acc + v.views, 0);
  const sumSecond = secondHalf.reduce((acc, v) => acc + v.views, 0);
  const diff = sumSecond - sumFirst;
  const trendUp = diff >= 0;
  const percentChange = sumFirst > 0 ? Math.abs(diff / sumFirst) * 100 : 0;

  const capitalizedName =
    username

  return (
    <section className="py-6 lg:py-16 min-h-[40vh]">
      <div className="w-full max-w-[1300px] mx-auto px-4">
        <h2 className="text-4xl md:text-4xl font-bold my-2">
          Welcome back,{" "}
          <span
            className="text-accent cursor-pointer hover:opacity-80"
            onClick={() => navigate("/profile")}
          >
            {capitalizedName}
          </span>
           !
        </h2>
        

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 my-6">
          {/* Views */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Views
                {trendUp ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : totalViews}
              </div>
              <p className="text-sm mt-1 text-muted-foreground">
                {trendUp ? "+" : "-"}
                {percentChange.toFixed(1)}% from last period
              </p>
            </CardContent>
          </Card>

          {/* Views per post average */}
          <Card>
            <CardHeader>
              <CardTitle>Views/Post</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {loading || !viewsPerPost.length
                ? "..."
                : Math.round(totalViews / viewsPerPost.length)}
            </CardContent>
          </Card>

          {/* Posts */}
          <Card>
            <CardHeader>
              <CardTitle>Posts</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {loading ? "..." : postCount}
            </CardContent>
          </Card>

          {/* Avg Rating */}
          <Card>
            <CardHeader>
              <CardTitle>Avg Rating</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">
              {loading ? "..." : avgRating}
            </CardContent>
          </Card>
        </div>
        
        <button
          onClick={() => navigate("/write")}
          className="my-2 px-6 py-2 border rounded-full hover:bg-white hover:text-[#1d3439] transition w-full lg:w-48"
        >
          Write a post
        </button>
      </div>
    </section>
  );
}
