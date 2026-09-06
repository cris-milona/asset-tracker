// Shared height for the list and map panels on the Assets page, so they line up
// edge-to-edge instead of using two different fixed pixel values. Relative to the
// viewport so it scales with screen size instead of leaving empty space (or forcing
// a scroll) on very large or very small screens.
export const ASSET_PANEL_HEIGHT = 'calc(100vh - 260px)';
export const ASSET_PANEL_MIN_HEIGHT = 320;
