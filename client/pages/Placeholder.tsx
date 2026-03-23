import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface PlaceholderProps {
  title: string;
  description?: string;
}

export default function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <div className="mb-6">
            <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <span className="text-2xl">📄</span>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">{title}</h1>
          <p className="text-lg text-muted-foreground mb-6 max-w-md">
            {description ||
              "This page is ready to be customized. Let us know what content you'd like here!"}
          </p>
          <p className="text-base text-muted-foreground mb-8">
            Continue prompting to fill in this page's content.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-secondary transition-all"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </Layout>
  );
}
