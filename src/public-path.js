let fsPricingWrapperElement = document.getElementById('fs_pricing_wrapper');

if (
    fsPricingWrapperElement &&
    fsPricingWrapperElement.dataset &&
    fsPricingWrapperElement.dataset.publicUrl
) {
    __webpack_public_path__ = fsPricingWrapperElement.dataset.publicUrl
}