import React from 'react';
import PropTypes from 'prop-types';
import nanoid from 'nanoid';
import { Trans } from 'react-i18next';
import Tooltip from './index';

const CustomTooltip = ({
    id, title, className, contentItemClass, place = 'right', columnClass = 'grid h-75', content, trigger, overridePosition, scrollHide,
}) =>
    <Tooltip id={id} className={className} place={place} trigger={trigger}
             overridePosition={overridePosition}
             scrollHide={scrollHide}
    >
        {title && <div className="pb-4 h-25 font-weight-bold"><Trans>{title}</Trans></div>}
        <div className={columnClass}>
            {React.Children.map(
                content,
                item =>
                    <div key={nanoid()}
                         className={`justify-content-between w-100 text-truncate ${contentItemClass}`}>
                        <Trans>{item}</Trans>
                    </div>,
            )}
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
};

export default CustomTooltip;
