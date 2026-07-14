export const Logo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={100}
    height={100}
    fill="none"
  >
    <path fill="url(#a)" d="M14 0h72v100H14z" />
    <defs>
      <pattern
        id="a"
        width={1}
        height={1}
        patternContentUnits="objectBoundingBox"
      >
        <use xlinkHref="#b" transform="matrix(.00772 0 0 .00556 -.002 0)" />
      </pattern>
      <image
        xlinkHref="data:image/png;base64,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"
        id="b"
        width={130}
        height={180}
        preserveAspectRatio="none"
      />
    </defs>
  </svg>
);
