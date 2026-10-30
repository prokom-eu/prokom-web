import type { Block } from 'payload'

import { tenantIdOf } from '../../../../lib/tenant/id'

/**
 * A service page of the Instalacje line (ADR-I002 §0): the block only points at the service —
 * its texts, packages and FAQ live in `InstServices`, its widgets and fixed sections in code.
 * One block per page, as the page's first block (it carries the h1).
 */
export const InstServiceBlock: Block = {
  slug: 'instService',
  interfaceName: 'InstServiceBlock',
  labels: {
    singular: 'Instalacje: strona usługi',
    plural: 'Instalacje: strony usług',
  },
  fields: [
    {
      name: 'service',
      label: 'Usługa',
      type: 'relationship',
      relationTo: 'inst-services',
      required: true,
      filterOptions: ({ data }) => {
        const tenant = tenantIdOf(data?.tenant)
        return tenant === null ? false : { tenant: { equals: tenant } }
      },
      admin: {
        description:
          'Treść strony (hero, zestawy, cena, FAQ, powiązane) edytuje się w kolekcji Usługi Instalacji.',
      },
    },
  ],
}
