/**
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

import {Component, type ReactNode} from 'react';
import {type ThemePreference} from 'a2ui-bridge';
import {SlackEmptyPreview} from './SlackEmptyPreview';
import {PreviewStatus, type PreviewSnapshot} from './preview-snapshot';

/** A snapshot whose blocks hold a render. */
type ReadyPreviewSnapshot = PreviewSnapshot & {status: PreviewStatus.READY};

/** Inputs to `SlackPreviewState`. */
interface SlackPreviewStateProps {
  /** The render to show. */
  readonly snapshot: PreviewSnapshot;
  /** Composer's theme, which the empty-state sample message follows. */
  readonly theme?: ThemePreference;
  /** Draws a ready render. */
  readonly renderReady: (snapshot: ReadyPreviewSnapshot) => ReactNode;
  /** Draws controls shown below a ready render, such as the Block Kit export. */
  readonly renderExport?: (snapshot: ReadyPreviewSnapshot) => ReactNode;
}

interface RevisionErrorBoundaryProps {
  readonly revision: number;
  readonly children: ReactNode;
}

interface RevisionErrorBoundaryState {
  readonly error: Error | null;
}

/**
 * Chooses what the preview shows for a snapshot's status: the render, the empty
 * state, or a waiting or error message, followed by the snapshot's diagnostics.
 * A render that throws shows an error until the next revision.
 */
export function SlackPreviewState({
  snapshot,
  theme,
  renderReady,
  renderExport,
}: SlackPreviewStateProps) {
  const isReady = snapshot.status === PreviewStatus.READY;
  const readySnapshot = isReady ? (snapshot as ReadyPreviewSnapshot) : undefined;
  const isEmpty = snapshot.status === PreviewStatus.EMPTY && snapshot.diagnostics.length === 0;

  return (
    <section className="slack-preview-state" aria-label="Slack preview state">
      {readySnapshot ? (
        <RevisionErrorBoundary revision={readySnapshot.revision}>
          <ReadyPreviewContent
            renderExport={renderExport}
            renderReady={renderReady}
            snapshot={readySnapshot}
          />
        </RevisionErrorBoundary>
      ) : isEmpty ? (
        <SlackEmptyPreview theme={theme} />
      ) : (
        <PreviewStatusMessage snapshot={snapshot} />
      )}
      {!isEmpty ? <PreviewDiagnostics snapshot={snapshot} /> : null}
    </section>
  );
}

class RevisionErrorBoundary extends Component<
  RevisionErrorBoundaryProps,
  RevisionErrorBoundaryState
> {
  override state: RevisionErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): RevisionErrorBoundaryState {
    return {error};
  }

  override componentDidUpdate(previousProps: RevisionErrorBoundaryProps): void {
    if (previousProps.revision !== this.props.revision && this.state.error) {
      this.setState({error: null});
    }
  }

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <div role="alert" aria-live="assertive">
          <p>Slack renderer failed.</p>
          <p>{this.state.error.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

interface ReadyPreviewContentProps {
  readonly snapshot: ReadyPreviewSnapshot;
  readonly renderReady: (snapshot: ReadyPreviewSnapshot) => ReactNode;
  readonly renderExport?: (snapshot: ReadyPreviewSnapshot) => ReactNode;
}

function ReadyPreviewContent({snapshot, renderReady, renderExport}: ReadyPreviewContentProps) {
  return (
    <>
      {renderReady(snapshot)}
      {renderExport ? <div aria-label="Slack preview actions">{renderExport(snapshot)}</div> : null}
    </>
  );
}

function PreviewStatusMessage({snapshot}: {readonly snapshot: PreviewSnapshot}) {
  if (snapshot.status === PreviewStatus.ERROR) {
    return (
      <div role="alert" aria-live="assertive">
        <p>Slack preview could not render.</p>
      </div>
    );
  }

  const message =
    snapshot.status === PreviewStatus.WAITING
      ? 'Waiting for Slack preview data.'
      : 'A2UI Slack Sandbox active. Waiting for Slack RENDER_A2UI payloads.';

  return (
    <div role="status" aria-live="polite">
      <p>{message}</p>
    </div>
  );
}

function PreviewDiagnostics({snapshot}: {readonly snapshot: PreviewSnapshot}) {
  if (snapshot.diagnostics.length === 0) {
    return null;
  }

  return (
    <ul aria-label="Preview diagnostics">
      {snapshot.diagnostics.map((diagnostic, index) => (
        <li
          key={`${snapshot.revision}-${index}-${diagnostic.level}-${diagnostic.code}-${
            diagnostic.componentId ?? ''
          }`}
        >
          <strong>{diagnostic.level}</strong> <code>{diagnostic.code}</code>{' '}
          {diagnostic.componentId ? <span>{diagnostic.componentId} </span> : null}
          <span>{diagnostic.message}</span>
        </li>
      ))}
    </ul>
  );
}
