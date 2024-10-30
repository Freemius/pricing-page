/** global __webpack_public_path__ */
let fsPricingWrapperElement = document.getElementById('fs_pricing_wrapper');

if (
  fsPricingWrapperElement &&
  fsPricingWrapperElement.dataset &&
  fsPricingWrapperElement.dataset.publicUrl
) {
  // eslint-disable-next-line no-undef
  __webpack_public_path__ = fsPricingWrapperElement.dataset.publicUrl;
}
