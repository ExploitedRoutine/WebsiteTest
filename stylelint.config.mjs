/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard"],
  rules: {
    // Preserve the existing compact CSS and avoid type-selector ordering false positives.
    "declaration-block-single-line-max-declarations": null,
    "no-descending-specificity": null,
    // Retain legacy print aliases alongside their modern equivalents.
    "property-no-deprecated": null,
    "media-feature-range-notation": "prefix",
  },
};
