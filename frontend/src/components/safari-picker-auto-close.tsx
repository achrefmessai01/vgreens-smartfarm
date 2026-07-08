'use client';

import { useEffect } from 'react';

const PICKER_INPUT_TYPES = new Set(['date', 'time', 'datetime-local']);

/**
 * Desktop Safari keeps the native date/time picker popover open after a value
 * is picked (WebKit only dismisses it when focus leaves the input), so we blur
 * the input once a selection commits. Scoped to desktop Safari: iOS fires
 * `change` on every wheel tick, and blurring there would dismiss the picker
 * mid-selection.
 */
export function SafariPickerAutoClose() {
  useEffect(() => {
    const isDesktopSafari =
      navigator.vendor === 'Apple Computer, Inc.' &&
      !/iPhone|iPad|iPod/.test(navigator.userAgent) &&
      // iPadOS reports a macOS user agent but exposes touch points.
      navigator.maxTouchPoints < 2;

    if (!isDesktopSafari) return;

    const closePickerOnChange = (event: Event) => {
      const target = event.target;
      if (
        !(target instanceof HTMLInputElement) ||
        !PICKER_INPUT_TYPES.has(target.type)
      ) {
        return;
      }
      if (document.activeElement === target) {
        target.blur();
        return;
      }
      // Popovers opened via showPicker() never focus the input, so blur()
      // can't dismiss them; briefly disabling the input forces WebKit to
      // close the popover instead.
      target.disabled = true;
      requestAnimationFrame(() => {
        target.disabled = false;
      });
    };

    document.addEventListener('change', closePickerOnChange, true);
    return () =>
      document.removeEventListener('change', closePickerOnChange, true);
  }, []);

  return null;
}
