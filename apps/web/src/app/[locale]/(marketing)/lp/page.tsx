import { redirect } from "next/navigation";

type LpIndexPageProps = {
  params: {
    locale: string;
  };
};

export default function LpIndexPage({ params }: LpIndexPageProps) {
  const locale = params.locale || "ja";
  redirect(`/${locale}/lp/general`);
}
