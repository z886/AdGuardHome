import React from 'react';
import PropTypes from 'prop-types';
import nanoid from 'nanoid';
import { Trans } from 'react-i18next';
import Tooltip from './index';

const CustomTooltip = ({
    id, title, className, contentItemClass, place = 'right', columnClass = 'grid h-100', content, trigger, overridePosition, scrollHide,
    renderContent = React.Children.map(
        content,
        item =>
            <div key={nanoid()} className={contentItemClass}>
                <Trans>{item}</Trans>
            </div>,
    ),
}) =>
    <Tooltip id={id} className={className} place={place} trigger={trigger}
             overridePosition={overridePosition}
             scrollHide={scrollHide}
    >
        {title && <div className="pb-4 h-25 font-weight-bold grid-content"><Trans>{title}</Trans></div>}
        <div className={columnClass}>
            {renderContent}
        </div>
    </Tooltip>;

CustomTooltip.propTypes = {
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    place: PropTypes.string,
    className: PropTypes.string,
    columnClass: PropTypes.string,
    contentItemClass: PropTypes.string,
    overridePosition: PropTypes.func,
    scrollHide: PropTypes.bool,
    content: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array,
    ]),
    trigger: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]),
    renderContent: PropTypes.arrayOf(PropTypes.element),
};

export default CustomTooltip;
