import React from 'react';
import PropTypes from 'prop-types';
import nanoid from 'nanoid';
import { Trans } from 'react-i18next';
import Tooltip from './index';

const CustomTooltip = ({
    id, title, className, contentItemClass, place = 'right', columnClass = 'grid h-75', content,
}) =>
    <Tooltip id={id} className={className} place={place}>
        {title && <div className="pb-4 h-25"><Trans>{title}</Trans></div>}
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
    content: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array,
    ]),
};

export default CustomTooltip;
