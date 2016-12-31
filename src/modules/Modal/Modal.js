import _ from 'lodash'
import React, { PropTypes } from 'react'
import cx from 'classnames'

import ModalHeader from './ModalHeader'
import ModalContent from './ModalContent'
import ModalActions from './ModalActions'
import ModalDescription from './ModalDescription'
import Icon from '../../elements/Icon'
import Portal from '../../addons/Portal'

import {
  AutoControlledComponent as Component,
  customPropTypes,
  getElementType,
  getUnhandledProps,
  isBrowser,
  makeDebugger,
  META,
  useKeyOnly,
} from '../../lib'

const debug = makeDebugger('modal')

const _meta = {
  name: 'Modal',
  type: META.TYPES.MODULE,
  props: {
    size: ['fullscreen', 'large', 'small'],
    dimmer: ['inverted', 'blurring'],
  },
}

/**
 * A modal displays content that temporarily blocks interactions with the main view of a site
 * @see Confirm
 * @see Portal
 */
class Modal extends Component {
  static propTypes = {
    /** An element type to render as (string or function). */
    as: customPropTypes.as,

    /** Primary content. */
    children: PropTypes.node,

    /** Additional classes. */
    className: PropTypes.string,

    /** Icon */
    closeIcon: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.object,
      PropTypes.bool,
    ]),

    /** A modal can reduce its complexity */
    basic: PropTypes.bool,

    /** Initial value of open. */
    defaultOpen: PropTypes.bool,

    /** A modal can appear in a dimmer */
    dimmer: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.oneOf(_meta.props.dimmer),
    ]),

    /** The node where the modal should mount.. */
    mountNode: PropTypes.any,

    /**
     * Called when a close event happens
     *
     * @param {SyntheticEvent} event - React's original SyntheticEvent.
     * @param {object} data - All props.
     */
    onClose: PropTypes.func,

    /**
     * Called when the portal is mounted on the DOM
     *
     * @param {null}
     * @param {object} data - All props.
     */
    onMount: PropTypes.func,

    /**
     * Called when an open event happens
     *
     * @param {SyntheticEvent} event - React's original SyntheticEvent.
     * @param {object} data - All props.
     */
    onOpen: PropTypes.func,

    /**
     * Called when the portal is unmounted from the DOM
     *
     * @param {null}
     * @param {object} data - All props.
     */
    onUnmount: PropTypes.func,

    /** Controls whether or not the Modal is displayed. */
    open: PropTypes.bool,

    /** A modal can vary in size */
    size: PropTypes.oneOf(_meta.props.size),

    /**
     * NOTE: Any unhandled props that are defined in Portal are passed-through
     * to the wrapping Portal.
     */
  }

  static defaultProps = {
    dimmer: true,
    // Do not access document when server side rendering
    mountNode: isBrowser ? document.body : null,
  }

  static autoControlledProps = [
    'open',
  ]

  static _meta = _meta
  static Header = ModalHeader
  static Content = ModalContent
  static Description = ModalDescription
  static Actions = ModalActions

  state = {}

  componentWillUnmount() {
    debug('componentWillUnmount()')
    this.handlePortalUnmount()
  }

  addClasses = (...classes) => {
    const { mountNode } = this.props;

    classes.forEach(className => {
      mountNode.classList.add(className);

      const countName = `${className}_count`;

      const currentCount = mountNode[countName];

      mountNode[countName] = currentCount === undefined ? 1 : currentCount + 1;
    })
  }

  removeClasses = (...classes) => {
    const { mountNode } = this.props;

    classes.forEach(className => {
      const countName = `${className}_count`;

      const mountCountValue = mountNode[countName];

      const currentCount = mountCountValue === undefined ? 0 : mountCountValue - 1;

      if (currentCount === 0) {
        mountNode.classList.remove(className);
      }

      mountNode[countName] = currentCount;
    })
  }

  handleClose = (e) => {
    debug('close()')

    const { onClose } = this.props
    if (onClose) onClose(e, this.props)

    this.trySetState({ open: false })
  }

  handleOpen = (e) => {
    debug('open()')

    const { onOpen } = this.props
    if (onOpen) onOpen(e, this.props)

    this.trySetState({ open: true })
  }

  handlePortalMount = (e) => {
    debug('handlePortalMount()')
    const { dimmer } = this.props

    if (dimmer) {
      debug('adding dimmer')
      this.addClasses('dimmable', 'dimmed')

      if (dimmer === 'blurring') {
        debug('adding blurred dimmer')
        this.addClasses('blurring')
      }
    }

    this.setPosition()

    const { onMount } = this.props
    if (onMount) onMount(e, this.props)
  }

  handlePortalUnmount = (e) => {
    debug('handlePortalUnmount()')

    // Always remove all dimmer classes.
    // If the dimmer value changes while the modal is open, then removing its
    // current value could leave cruft classes previously added.
    const { dimmer } = this.props

    if (dimmer) {
      this.removeClasses('dimmable', 'dimmed');

      if (dimmer === 'blurring') {
        this.removeClasses('blurring');
      }
    }

    if (this.state.scrolling) {
      this.removeClasses('scrolling')
    }

    cancelAnimationFrame(this.animationRequestId)

    const { onUnmount } = this.props
    if (onUnmount) onUnmount(e, this.props)
  }

  setPosition = () => {
    if (this._modalNode) {
      const { mountNode } = this.props
      const { height } = this._modalNode.getBoundingClientRect()

      const marginTop = -Math.round(height / 2)
      const scrolling = height >= window.innerHeight

      const newState = {}

      if (this.state.marginTop !== marginTop) {
        newState.marginTop = marginTop
      }

      if (this.state.scrolling !== scrolling) {
        newState.scrolling = scrolling

        if (scrolling) {
          this.addClasses('scrolling')
        } else {
          this.removeClasses('scrolling')
        }
      }

      if (Object.keys(newState).length > 0) this.setState(newState)
    }

    this.animationRequestId = requestAnimationFrame(this.setPosition)
  }

  render() {
    const { open } = this.state
    const { basic, children, className, closeIcon, dimmer, mountNode, size } = this.props

    // Short circuit when server side rendering
    if (!isBrowser) return null

    const { marginTop, scrolling } = this.state
    const classes = cx(
      'ui',
      size,
      useKeyOnly(basic, 'basic'),
      useKeyOnly(scrolling, 'scrolling'),
      'modal transition visible active',
      className,
    )
    const unhandled = getUnhandledProps(Modal, this.props)
    const portalPropNames = _.keys(Portal.propTypes)

    const rest = _.omit(unhandled, portalPropNames)
    const portalProps = _.pick(unhandled, portalPropNames)
    const ElementType = getElementType(Modal, this.props)

    const closeIconName = closeIcon === true ? 'close' : closeIcon

    const modalJSX = (
      <ElementType {...rest} className={classes} style={{ marginTop }} ref={c => (this._modalNode = c)}>
        {Icon.create(closeIconName, { onClick: this.handleClose })}
        {children}
      </ElementType>
    )

    // wrap dimmer modals
    const dimmerClasses = !dimmer ? null : cx(
      'ui',
      dimmer === 'inverted' && 'inverted',
      'page modals dimmer transition visible active',
    )

    // Heads up!
    //
    // The SUI CSS selector to prevent the modal itself from blurring requires an immediate .dimmer child:
    // .blurring.dimmed.dimmable>:not(.dimmer) { ... }
    //
    // The .blurring.dimmed.dimmable is the body, so that all body content inside is blurred.
    // We need the immediate child to be the dimmer to :not() blur the modal itself!
    // Otherwise, the portal div is also blurred, blurring the modal.
    //
    // We cannot them wrap the modalJSX in an actual <Dimmer /> instead, we apply the dimmer classes to the <Portal />.

    return (
      <Portal
        closeOnRootNodeClick
        closeOnDocumentClick={false}
        {...portalProps}
        className={dimmerClasses}
        mountNode={mountNode}
        onClose={this.handleClose}
        onMount={this.handlePortalMount}
        onOpen={this.handleOpen}
        onUnmount={this.handlePortalUnmount}
        open={open}
      >
        {modalJSX}
      </Portal>
    )
  }
}

export default Modal
