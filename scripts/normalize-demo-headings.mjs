/*
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Normalizes heading text across A2UI demo messages.
 *
 * Heading variants (e.g. legacy `variant: 'h1'..'h6'`) render plain text, so a
 * matching Markdown heading marker would appear literally. Only remove that
 * redundant marker from static Text components that specify a heading variant;
 * standard Markdown headings (`#`..`######`) on Text components without a
 * heading variant, Markdown bodies, bindings, and source messages stay untouched.
 */
export function normalizeDemoHeadings(messages) {
  return messages.map(message => {
    if (message.createSurface?.components) {
      return {
        ...message,
        createSurface: {
          ...message.createSurface,
          components: message.createSurface.components.map(normalizeComponent),
        },
      };
    }
    if (message.updateComponents?.components) {
      return {
        ...message,
        updateComponents: {
          ...message.updateComponents,
          components: message.updateComponents.components.map(normalizeComponent),
        },
      };
    }
    return message;
  });
}

function normalizeComponent(component) {
  if (
    component.component !== 'Text' ||
    !/^h[1-6]$/.test(component.variant) ||
    typeof component.text !== 'string'
  ) {
    return component;
  }
  const marker = new RegExp(`^#{${component.variant.slice(1)}}[ \\t]+`);
  return {...component, text: component.text.replace(marker, '')};
}
