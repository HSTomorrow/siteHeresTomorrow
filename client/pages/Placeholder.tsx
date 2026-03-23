import Layout from "@/components/Layout";
import { Link } from "react-router-dom";
import { ArrowLeft, Leaf } from "lucide-react";

interface PlaceholderProps {
  title: string;
  description?: string;
}

export default function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center px-4 max-w-md">
          <div className="mb-8">
            <div className="inline-block p-6 bg-primary/10 rounded-full mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                <Leaf className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-6">{title}</h1>
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            {description ||
              "This page is ready to be customized. Let us know what content you'd like here!"}
          </p>
          <p className="text-base text-muted-foreground mb-12 font-medium">
            Continue prompting to fill in this page's content.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-primary-dark transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </Layout>
  );
}
