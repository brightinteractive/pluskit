import * as React from 'react'

/**
 * Adjusts the Y position of each child so that equal x,y values aren't
 * rendered on the exact same point
 **/
export function LineGroup(props: { spacing: number, children: React.ReactChild }) {
  const { offset, spacing } = getSpacing();

  return (
    <g>
    {
      React.Children.map(props.children, (child, i) =>
        <g transform={`translate(0,${i * spacing + offset})`}>
          {child}
        </g>
      )
    }
    </g>
  );

  function getSpacing() {
    const count = React.Children.count(props.children);

    if (count <= 1) {
      return { offset: 0, spacing: 0 };

    } else {
      const totalSpacing = (count - 1) * props.spacing;
      return { offset: totalSpacing * -0.5, spacing: props.spacing };
    }
  }
}
