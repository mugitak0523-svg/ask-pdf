"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

type AdminSectionPageProps = {
  params: { section: string };
};

const AdminSectionPage = ({ params }: AdminSectionPageProps) => {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/admin?section=${encodeURIComponent(params.section)}`);
  }, [params.section, router]);

  return null;
};

export default AdminSectionPage;
