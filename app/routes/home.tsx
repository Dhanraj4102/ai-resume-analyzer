import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router"; // ✅ added Link
import { usePuterStore } from "~/lib/puter";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { auth, kv, isLoading } = usePuterStore(); // ✅ added isLoading
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  useEffect(() => {
    if (isLoading) return; // ✅ wait for auth

    if (!auth.isAuthenticated) {
      navigate("/auth?next=/");
    }
  }, [auth.isAuthenticated, isLoading]);

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);

      const resumes = (await kv.list("resumes:*", true)) as KVItem[];

      const parsedResumes = resumes?.map((resume) =>
          JSON.parse(resume.value) as Resume
      );

      console.log("parsedResumes", parsedResumes);
      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    };

    loadResumes();
  }, []);

  return (
      <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar />
        <section className="main-section">
          <div className="page-heading py-16">
            <h1>Track Applications & Your Resume Ratings</h1>

            {!loadingResumes && resumes?.length === 0 ? (
                <h2>
                  No resumes found. Upload your first resume to get feedback.
                </h2>
            ) : (
                <h2>
                  Review Your Submissions And Check AI-Powered Feedback.
                </h2>
            )}
          </div>

          {loadingResumes && (
              <div className="flex flex-col items-center justify-center">
                <img
                    src="/images/resume-scan-2.gif"
                    className="w-[200px]"
                />
              </div>
          )}

          {!loadingResumes && resumes.length > 0 && (
              <div className="resumes-section">
                {resumes.map((resume) => (
                    <ResumeCard key={resume.id} resume={resume} />
                ))}
              </div>
          )}

          {!loadingResumes && resumes?.length === 0 && (
              <div className="flex flex-col items-center justify-center mt-10 gap-4">
                <Link
                    to="/upload"
                    className="primary-button w-fit text-xl font-semibold"
                >
                  Upload Resume
                </Link>
              </div>
          )}
        </section>
      </main>
  );
}