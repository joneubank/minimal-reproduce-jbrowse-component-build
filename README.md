## Minimal Reproduction - TS Build Errors from Linear View

This is a bare bones project importing the [JBrowse React Linear View](https://www.npmjs.com/package/@jbrowse/react-linear-genome-view).

It is unable to build because TypeScript attempts to run type validations on the `.ts` files that are exported in the `/src` folder.

### Setup Details

Using TypeScript v. `5.1.3`

The `.tsconfig` is the default generated by `npx tsc --init` with two modifications:
`noEmit: true` set to stop the generated files in this demo.
`"jsx":"preserve"` set to allow building react.

The project itself has a single component [`/src/LinearComponent.tsx`](/src/LinearComponent.tsx) that is a plain wrapper over the `JBrowseLinearGenomeView`. The component is not configured to show anything but the component itself passes the `tsc` type checks.

### Steps to Reproduce

1. `npm ci`
2. `npm run build`

The build step will fail.

Summary:
```
Found 16 errors in 6 files.

Errors  Files
     1  node_modules/@jbrowse/plugin-linear-genome-view/src/BaseLinearDisplay/models/util.ts:35
     4  node_modules/@jbrowse/plugin-linear-genome-view/src/LinearGenomeView/components/ExportSvgDialog.tsx:86
     4  node_modules/@jbrowse/plugin-linear-genome-view/src/LinearGenomeView/components/OverviewScalebar.tsx:101
     3  node_modules/@jbrowse/plugin-linear-genome-view/src/LinearGenomeView/components/RefNameAutocomplete/util.ts:50
     2  node_modules/@jbrowse/plugin-linear-genome-view/src/LinearGenomeView/model.ts:1379
     2  node_modules/@jbrowse/plugin-linear-genome-view/src/LinearGenomeView/svgcomponents/SVGHeader.tsx:44
```

### Discussion of Errors

These errors in general are caused by the presence of the `*.ts` files in the `/src` directory included in the published package. TypeScript does not have the ability to ignore some `.ts` files and not others. There is a long discussion about [this issue](https://github.com/microsoft/TypeScript/issues/47387) in the TypeScript github repository where the maintainers have closed it as working correctly. This means that TypeScript is going to validate the types in the `*.ts` files in the imported package, and if there are any issues the build will fail. Consequently, if the importing package has a `.tsconfig` that causes conflicts with the dependency code then it cannot be built.

The specific issues raised by this package are summarized below, but in general it would be best to not have the TypeScript source files published with the package. 

There are several categories of issues found in the package source files, most of which can be remedied through `.tsconfig` changes, and one of which can be remedied by importing a third party types package.

1. ES2022 lib dependencies:
   
   * `Property 'at' does not exist on type 'BaseBlock[]'. Do you need to change your target library? Try changing the 'lib' compiler option to 'es2022' or later.` 
   * `Property 'entries' does not exist on type 'ObjectConstructor'. Do you need to change your target library? Try changing the 'lib' compiler option to 'es2017' or later.`

   Adding `es2022` to the `.tsconfig` `lib` array will resolve these issues. This is an easy fix and its typical to use `ESNext` in libraries, but it should not be necessary to include additional libs in order to import this dependency.

2. Implict `any` issues:

   * Example: `Binding element 'displayString' implicitly has an 'any' type.`

   Standard TS error in the source.
   
3. Jest Types Dependency: `Cannot find name 'jest'.`
 
   Forces us to install 3rd party types package to resolve. `npm i -D @types/jest` . Installing this will resolve all type issues listed here, somehow.


### Additional Note: Circular Genome View

I tried the same thing with [JBrowse React Circular View](https://www.npmjs.com/package/@jbrowse/react-circular-genome-view) and there were no build issues. That file also exports a `/src` folder, which could still be problematic to some integrations, but at least for default setups there were no problems found.
