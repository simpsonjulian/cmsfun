import type { Vehicle } from './contentful';

/**
 * Built-in fallback content used when no Contentful credentials are configured,
 * so the demo runs out of the box. In a real deployment these come from the CMS.
 */
export const sampleVehicles: Vehicle[] = [
  {
    name: 'Tesla Model 3',
    slug: 'tesla-model-3',
    description:
      'A compact electric sedan with a minimalist interior, long range, and access to a fast-charging network. Quick, quiet, and software-driven.',
    imageUrl:
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'White Tesla Model 3 parked on a road',
    imageWidth: 1200,
    imageHeight: 800,
  },
  {
    name: 'Ford Mustang',
    slug: 'ford-mustang',
    description:
      'An American muscle car icon. Aggressive styling, a throaty V8 option, and decades of motorsport heritage behind the galloping pony badge.',
    imageUrl:
      'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Yellow Ford Mustang on display',
    imageWidth: 1200,
    imageHeight: 800,
  },
  {
    name: 'Toyota Land Cruiser',
    slug: 'toyota-land-cruiser',
    description:
      'A legendary full-size off-roader built for reliability and rough terrain. Body-on-frame toughness with everyday comfort.',
    imageUrl:
      'https://images.unsplash.com/photo-1633507106985-67d22a51fdd9?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Toyota Land Cruiser on a dirt trail',
    imageWidth: 1200,
    imageHeight: 800,
  },
  {
    name: 'Porsche 911',
    slug: 'porsche-911',
    description:
      'A rear-engined sports car with timeless silhouette and razor-sharp handling. The benchmark every other sports car is measured against.',
    imageUrl:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
    imageAlt: 'Silver Porsche 911 on a coastal road',
    imageWidth: 1200,
    imageHeight: 800,
  },
];
