import React from 'react';
import nanoid from 'nanoid';
import { formatClientCell } from '../../../helpers/formatClientCell';
import getHintElement from './getHintElement';
import CustomTooltip from '../Tooltip/CustomTooltip';

const getClientCell = (row, t, isDetailed) => {
    const { client, domain } = row.original;
    const id = nanoid();
    return (
        <div className="logs__row logs__row--overflow justify-content-between">
            <div>
                {<div data-tip={true} data-for={id}>{formatClientCell(row, t)}</div>}
                {isDetailed && <div className="detailed-info">test</div>}
            </div>
            {<CustomTooltip id={id}
                            content={{
                                table_name: domain,
                                ip: client,
                                dhcp_table_hostname: 'dhcp_table_hostname',
                                country: 'country',
                                network: 'network',
                            }}
                            place="bottom"
                            title="client_details"
            />}
            {getHintElement({
                className: 'icons mt-3 icon--small',
                dataTip: true,
                xlinkHref: 'options_dots',
                tooltipComponent: ({ id }) => <CustomTooltip
                    className="px-0 py-3"
                    rowClass="tooltip__option py-3 pl-5"
                    id={id}
                    columnClass="h-100"
                    place="left"
                    content={['barrel_roll', 'add_domain_to_whitelist', 'unblock_btn']} />,
            })}
        </div>
    );
};

export default getClientCell;
