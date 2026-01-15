import { redirect } from 'next/navigation';

export default function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const params = new URLSearchParams();
  
  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value !== undefined) {
      params.append(key, value);
    }
  });

  const queryString = params.toString();
  const redirectPath = queryString ? `/identifier?${queryString}` : '/identifier';

  redirect(redirectPath);
}
