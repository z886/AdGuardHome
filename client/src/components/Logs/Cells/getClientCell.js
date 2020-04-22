import React from 'react';
import nanoid from 'nanoid';
import { formatClientCell } from '../../../helpers/formatClientCell';
import getHintElement from './getHintElement';
import CustomTooltip from '../Tooltip/CustomTooltip';

const getClientCell = (row, t, isDetailed) => {
    const { client, domain, info: { name } } = row.original;
    const id = nanoid();

    const data = {
        table_name: domain,
        ip: client,
        dhcp_table_hostname: 'hostname_stub',
        country: 'country_stub',
        network: 'network_stub',
    };

    const options = ['unblock_btn', 'add_domain_to_whitelist', 'barrel_roll'];

    return (
        <div className="logs__row logs__row--overflow justify-content-between">
            <div>
                {<div data-tip={true} data-for={id}>{formatClientCell(row, t, isDetailed)}</div>}
                {isDetailed && <div className="detailed-info">{name}</div>}
            </div>
            {<CustomTooltip id={id} place="bottom" title="client_details"
                            contentItemClass='key-colon'
                            content={Object.entries(data)} />}
            {getHintElement({
                className: 'icons mt-3 icon--small',
                dataTip: true,
                xlinkHref: 'options_dots',
                contentItemClass: 'tooltip__option py-3 px-5 key-colon',
                columnClass: 'h-100 grid__one-row',
                content: options,
                place: 'left',
                tooltipClass: 'px-0 py-3',
            })}
        </div>
    );
};

export default getClientCell;
