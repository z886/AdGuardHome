import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import ReactTable from 'react-table';
import classNames from 'classnames';
import endsWith from 'lodash/endsWith';
import escapeRegExp from 'lodash/escapeRegExp';
import {
    BLOCK_ACTIONS,
    REASON_TO_COLOR_CLASS_MAP,
    TABLE_DEFAULT_PAGE_SIZE,
    TRANSITION_TIMEOUT,
} from '../../helpers/constants';
import getDateCell from './Cells/getDateCell';
import getDomainCell from './Cells/getDomainCell';
import getClientCell from './Cells/getClientCell';
import getResponseCell from './Cells/getResponseCell';

class Table extends Component {
    toggleBlocking = (type, domain) => {
        const {
            t, setRules, getFilteringStatus, addSuccessToast,
        } = this.props;
        const { userRules } = this.props.filtering;

        const lineEnding = !endsWith(userRules, '\n') ? '\n' : '';
        const baseRule = `||${domain}^$important`;
        const baseUnblocking = `@@${baseRule}`;

        const blockingRule = type === BLOCK_ACTIONS.block ? baseUnblocking : baseRule;
        const unblockingRule = type === BLOCK_ACTIONS.block ? baseRule : baseUnblocking;
        const preparedBlockingRule = new RegExp(`(^|\n)${escapeRegExp(blockingRule)}($|\n)`);
        const preparedUnblockingRule = new RegExp(`(^|\n)${escapeRegExp(unblockingRule)}($|\n)`);

        const matchPreparedBlockingRule = userRules.match(preparedBlockingRule);
        const matchPreparedUnblockingRule = userRules.match(preparedUnblockingRule);

        if (matchPreparedBlockingRule) {
            setRules(userRules.replace(`${blockingRule}`, ''));
            addSuccessToast(`${t('rule_removed_from_custom_filtering_toast')}: ${blockingRule}`);
        } else if (!matchPreparedUnblockingRule) {
            setRules(`${userRules}${lineEnding}${unblockingRule}\n`);
            addSuccessToast(`${t('rule_added_to_custom_filtering_toast')}: ${unblockingRule}`);
        } else if (matchPreparedUnblockingRule) {
            addSuccessToast(`${t('rule_added_to_custom_filtering_toast')}: ${unblockingRule}`);
            return;
        } else if (!matchPreparedBlockingRule) {
            addSuccessToast(`${t('rule_removed_from_custom_filtering_toast')}: ${blockingRule}`);
            return;
        }

        getFilteringStatus();
    };

    columns = [
        {
            Header: this.props.t('time_table_header'),
            accessor: 'time',
            Cell: (row) => getDateCell(row, this.props.isDetailed),
            minWidth: 62,
            maxHeight: 60,
            headerClassName: 'logs__text',
        },
        {
            Header: this.props.t('request_table_header'),
            accessor: 'domain',
            Cell: (row) => getDomainCell(
                row,
                this.props.t,
                this.props.isDetailed,
                this.toggleBlocking,
                this.props.autoClients,
            ),
            minWidth: 180,
            maxHeight: 60,
            headerClassName: 'logs__text',
        },
        {
            Header: this.props.t('response_table_header'),
            accessor: 'response',
            Cell: (row) => getResponseCell(
                row,
                this.props.filtering,
                this.props.t,
                this.props.isDetailed,
            ),
            minWidth: 85,
            maxHeight: 60,
            headerClassName: 'logs__text',
        },
        {
            Header: () => {
                const plainSelected = classNames('cursor--pointer', {
                    'icon--selected': !this.props.isDetailed,
                });

                const detailedSelected = classNames('cursor--pointer', {
                    'icon--selected': this.props.isDetailed,
                });

                return <div className="d-flex justify-content-between">
                    {this.props.t('client_table_header')}
                    {<span>
                        <svg
                            className={`icons icon--small icon--active mr-2 cursor--pointer ${plainSelected}`}
                            onClick={() => this.props.toggleDetailedLogs(false)}>
                            <use xlinkHref='#list' />
                        </svg>
                    <svg
                        className={`icons icon--small icon--active cursor--pointer ${detailedSelected}`}
                        onClick={() => this.props.toggleDetailedLogs(true)}>
                        <use xlinkHref='#detailed_list' />
                    </svg>
                    </span>}
                </div>;
            },
            accessor: 'client',
            Cell: (row) => getClientCell(
                row,
                this.props.t,
                this.props.isDetailed,
                this.toggleBlocking,
                this.props.autoClients,
            ),
            minWidth: 140,
            maxHeight: 60,
            headerClassName: 'logs__text',
        },
    ];

    fetchData = (state) => {
        const { pages } = state;
        const { oldest, page, getLogs } = this.props;
        const isLastPage = pages && (page + 1 === pages);

        if (isLastPage) {
            getLogs(oldest, page);
        }
    };

    changePage = (page) => {
        this.props.setLoading(true);
        this.props.setLogsPage(page);
        this.props.setLogsPagination({
            page,
            pageSize: TABLE_DEFAULT_PAGE_SIZE,
        });
    };

    componentDidMount() {
        this.props.setLoading(false);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.page !== this.props.page) {
            setTimeout(() => this.props.setLoading(false), TRANSITION_TIMEOUT);
        }
    }

    render() {
        const {
            t,
            processingGetLogs,
            processingGetConfig,
            logs,
            pages,
            page,
            defaultPageSize,
        } = this.props;

        const isLoading = processingGetLogs || processingGetConfig || this.props.loading;

        return (
            <ReactTable
                manual
                minRows={0}
                page={page}
                pages={pages}
                columns={this.columns}
                filterable={false}
                sortable={false}
                resizable={false}
                data={logs || []}
                loading={isLoading}
                showPageJump={false}
                showPageSizeOptions={false}
                onFetchData={this.fetchData}
                onPageChange={this.changePage}
                className="logs__table"
                defaultPageSize={defaultPageSize || TABLE_DEFAULT_PAGE_SIZE}
                loadingText={t('loading_table_status')}
                rowsText={t('rows_table_footer_text')}
                noDataText={!isLoading
                && <label className="logs__text logs__text--bold">{t('empty_log')}</label>}
                pageText=''
                ofText=''
                showPagination={logs.length > 0}
                getPaginationProps={() => ({ className: 'custom-pagination custom-pagination--padding' })}
                getTbodyProps={() => ({ className: 'd-block' })}
                previousText={
                    <svg className="icons icon--small icon--gray w-100 h-100 cursor--pointer">
                        <use xlinkHref="#arrow-left" />
                    </svg>}
                nextText={
                    <svg className="icons icon--small icon--gray w-100 h-100 cursor--pointer">
                        <use xlinkHref="#arrow-right" />
                    </svg>}
                renderTotalPagesCount={() => false}
                getTrGroupProps={(_state, rowInfo) => {
                    if (!rowInfo) {
                        return {};
                    }

                    const { reason } = rowInfo.original;
                    const colorClass = REASON_TO_COLOR_CLASS_MAP[reason] || 'white';

                    return { className: colorClass };
                }}
                getTrProps={() => ({ className: this.props.isDetailed ? 'row--detailed' : '' })}
            />
        );
    }
}

Table.propTypes = {
    logs: PropTypes.array.isRequired,
    pages: PropTypes.number.isRequired,
    page: PropTypes.number.isRequired,
    autoClients: PropTypes.array.isRequired,
    defaultPageSize: PropTypes.number,
    oldest: PropTypes.string.isRequired,
    filtering: PropTypes.object.isRequired,
    processingGetLogs: PropTypes.bool.isRequired,
    processingGetConfig: PropTypes.bool.isRequired,
    isDetailed: PropTypes.bool.isRequired,
    setLogsPage: PropTypes.func.isRequired,
    setLogsPagination: PropTypes.func.isRequired,
    getLogs: PropTypes.func.isRequired,
    toggleDetailedLogs: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    setRules: PropTypes.func.isRequired,
    addSuccessToast: PropTypes.func.isRequired,
    getFilteringStatus: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    setLoading: PropTypes.func.isRequired,
};

export default withTranslation()(Table);
