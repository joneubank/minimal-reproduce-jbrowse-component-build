import {
  createViewState,
  JBrowseLinearGenomeView,
} from "@jbrowse/react-linear-genome-view";

export default function DemoComponent() {
  const state = createViewState({
    assembly: "any",
    tracks: [],
  });
  return <JBrowseLinearGenomeView viewState={state} />;
}
