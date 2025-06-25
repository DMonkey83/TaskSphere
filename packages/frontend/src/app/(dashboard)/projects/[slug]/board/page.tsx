import { ProjectBoardView } from "@/features/boards/project-board-view";

type BoardPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    view?: string;
  }>;
};

export default async function BoardPage({ params, searchParams }: BoardPageProps) {
  const { slug } = await params;
  const { view = "kanban" } = await searchParams;

  return (
    <div className="h-full">
      <ProjectBoardView slug={slug} view={view} />
    </div>
  );
}