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
    trigger,
    overridePosition,
    scrollHide,
    renderContent,
}) => {
    const id = nanoid();

    return <Fragment>
        <div data-tip={dataTip} data-for={dataTip ? id : undefined}
             data-event={trigger}
        >
            {xlinkHref && <svg className={className}>
                <use xlinkHref={`#${xlinkHref}`} />
            </svg>}
        </div>
        {dataTip &&
        <CustomTooltip className={tooltipClass} columnClass={columnClass}
                       contentItemClass={contentItemClass}
                       id={id} title={title} place={place} content={content}
                       trigger={trigger}
                       overridePosition={overridePosition}
                       scrollHide={scrollHide}
                       renderContent={renderContent}
        />}
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
    overridePosition: PropTypes.func,
    scrollHide: PropTypes.bool,
    trigger: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
    ]),
    content: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array,
    ]),
    renderContent: PropTypes.arrayOf(PropTypes.element),
};

export default getHintElement;
