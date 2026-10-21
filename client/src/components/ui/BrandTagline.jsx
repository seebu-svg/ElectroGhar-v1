import { BRAND_VALUES, BRAND_TAGLINE, BRAND_FOOTER_TAGLINE } from '../../utils/brand.mjs';

export default function BrandTagline({ footer = false, className = '' }) {
  return <p aria-label={footer ? BRAND_FOOTER_TAGLINE : BRAND_TAGLINE} className={`brand-tagline flex flex-wrap items-baseline gap-x-2 gap-y-1 font-heading text-sm font-medium tracking-wide text-content sm:text-base ${className}`}>
    {BRAND_VALUES.map((value, index) => <span key={value} aria-hidden="true">{footer && index > 0 && <span className="mr-2 font-normal text-brand-300">|</span>}{value}{!footer && <span className="text-brand-300">.</span>}</span>)}
  </p>;
}
