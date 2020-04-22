import React, { Fragment } from 'react';
import nanoid from 'nanoid';
import PropTypes from 'prop-types';
import CustomTooltip from '../Tooltip/CustomTooltip';

const getHintElement = ({
    className,
    contentItemClass,
    columnClass,
    dataTip,
    xlinkHref,
    content,
    title,
    place,
    tooltipClass,
}) => {
    const id = nanoid();

    return <Fragment>
        <div data-tip={dataTip} data-for={dataTip ? id : undefined}>
            {xlinkHref && <svg className={className}>
                <use xlinkHref={`#${xlinkHref}`} />
            </svg>}
        </div>
        <CustomTooltip className={tooltipClass} columnClass={columnClass}
                       contentItemClass={contentItemClass}
                       id={id} title={title} place={place} content={content} />
    </Fragment>;
};
getHintElement.propTypes = {
    className: PropTypes.string,
    contentItemClass: PropTypes.string,
    columnClass: PropTypes.string,
    tooltipClass: PropTypes.string,
    title: PropTypes.string,
    place: PropTypes.string,
    dataTip: PropTypes.string,
    xlinkHref: PropTypes.string,
    content: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array,
    ]),
};

export default getHintElement;
