export interface ExampleProject {
  id: string;
  label: string;
  /** one-line description shown in the switcher */
  blurb: string;
  entry: string;
  files: Record<string, string>;
}
