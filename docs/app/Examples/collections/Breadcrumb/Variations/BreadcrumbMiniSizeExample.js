import React from 'react'
import { Breadcrumb } from 'stardust'

const BreadcrumbMiniSizeExample = () => (
  <Breadcrumb size='mini'>
    <Breadcrumb.Section link>Home</Breadcrumb.Section>
    <Breadcrumb.Divider icon='right chevron' />
    <Breadcrumb.Section link>Registration</Breadcrumb.Section>
    <Breadcrumb.Divider icon='right chevron' />
    <Breadcrumb.Section active>Personal Information</Breadcrumb.Section>
  </Breadcrumb>
)

export default BreadcrumbMiniSizeExample
