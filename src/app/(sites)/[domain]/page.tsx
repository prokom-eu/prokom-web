import { requireTenant } from './tenant'

// Placeholder start page until pages from blocks arrive (S5).
export default async function TenantHomePage({ params }: { params: Promise<{ domain: string }> }) {
  const tenant = await requireTenant(params)
  return (
    <>
      <h1>{tenant.name}</h1>
      <p>Strona w budowie.</p>
    </>
  )
}
