import React from 'react'

import ComponentExample from 'docs/app/Components/ComponentDoc/ComponentExample'
import ExampleSection from 'docs/app/Components/ComponentDoc/ExampleSection'

const Variations = () => (
  <ExampleSection title='Variations'>
    <ComponentExample
      title='Divided'
      description='Items can be divided to better distinguish between grouped content'
      examplePath='views/Item/Variations/Divided'
    />

    <ComponentExample
      title='Relaxed'
      description='A group of items can relax its padding to provide more negative space'
      examplePath='views/Item/Variations/Relaxed'
    />
    <ComponentExample examplePath='views/Item/Variations/VeryRelaxed' />

    <ComponentExample
      title='Link Item'
      description='An item can be formatted so that the entire contents link to another page'
      examplePath='views/Item/Variations/Link'
    />

    <ComponentExample
      title='Vertical Alignment'
      description='Content can specify its vertical alignment'
      examplePath='views/Item/Variations/Alignment'
    />

    <ComponentExample
      title='Floated Content'
      description='Any content element can be floated left or right'
      examplePath='views/Item/Variations/Floated'
    />
  </ExampleSection>
)

export default Variations
