import type { VitrineShaderIntrinsicProps } from './types.js';

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'vitrine-shader': VitrineShaderIntrinsicProps;
    }
  }
}

export {};
