"use client";

import AdminPage from "../page";

type AdminSectionPageProps = {
  params: { section: string };
};

const AdminSectionPage = ({ params }: AdminSectionPageProps) => {
  return <AdminPage initialSection={params.section} />;
};

export default AdminSectionPage;
