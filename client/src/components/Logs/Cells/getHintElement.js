import React, { Fragment } from 'react';
import nanoid from 'nanoid';
import PropTypes from 'prop-types';

const getHintElement = ({
    className,
    dataTip,
    xlinkHref,
    tooltipComponent,
}) => {
    const id = nanoid();

    return <Fragment>
        <div data-tip={dataTip} data-for={dataTip ? id : undefined}>
            {xlinkHref && <svg className={className}>
                <use xlinkHref={`#${xlinkHref}`} />
            </svg>}
        </div>
        {dataTip && tooltipComponent({ id })}
    </Fragment>;
};

getHintElement.propTypes = {
    className: PropTypes.string,
    dataTip: PropTypes.string,
    xlinkHref: PropTypes.string,
    tooltipComponent: PropTypes.element.isRequired,
};

export default getHintElement;
