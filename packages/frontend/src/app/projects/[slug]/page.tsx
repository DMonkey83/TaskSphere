import ClientProjectDetails from "@/features/layout/client-project-details";

type ProjectPageProps = {
  params: {
    slug: string;
  };
};

export default function ProjectPage({ params }: ProjectPageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4">Project Page</h1>
      <ClientProjectDetails slug={params.slug} />
    </div>
  );
}
