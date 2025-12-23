import { redirect } from 'next/navigation';

export default function ComercialDetailRedirect({
  params,
}: {
  params: { id: string };
}) {
  redirect(`/documentos/${params.id}`);
}
