// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useState, useCallback} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';

import {GenericModal} from '@mattermost/components';

interface ActivityDelta {
    new_messages: number;
    new_members: number;
    last_activity_at: number; // timestamp in milliseconds
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    onDontShowAgain: () => Promise<void>;
    activityDelta?: ActivityDelta;
    channelName: string;
}

const ChannelActivityWarningModal: React.FC<Props> = ({
    isOpen,
    onClose,
    onConfirm,
    onDontShowAgain,
    activityDelta,
    channelName,
}) => {
    const intl = useIntl();
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const handleConfirm = useCallback(async () => {
        if (dontShowAgain) {
            // Wait for preference to be saved before continuing
            await onDontShowAgain();
        }
        onConfirm();
    }, [dontShowAgain, onConfirm, onDontShowAgain]);

    const formatActivityTime = (timestamp: number): string => {
        const now = Date.now();
        const diffMs = now - timestamp;
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 1) {
            const minutes = Math.max(1, Math.round(diffHours * 60));
            return intl.formatMessage({
                id: 'channel_settings.activity_warning.minutes_ago',
                defaultMessage: '{minutes} minutes ago',
            }, {minutes});
        }
        if (diffHours < 24) {
            const roundedHours = Math.round(diffHours);
            if (roundedHours === 1) {
                return intl.formatMessage({
                    id: 'channel_settings.activity_warning.hour_ago',
                    defaultMessage: '1 hour ago',
                }, {hours: roundedHours});
            }
            return intl.formatMessage({
                id: 'channel_settings.activity_warning.hours_ago',
                defaultMessage: '{hours} hours ago',
            }, {hours: roundedHours});
        }
        const days = Math.round(diffHours / 24);
        return intl.formatMessage({
            id: 'channel_settings.activity_warning.days_ago',
            defaultMessage: '{days} days ago',
        }, {days});
    };

    return (
        <GenericModal
            className='channel-activity-warning-modal'
            show={isOpen}
            onHide={onClose}
            modalHeaderText={
                <FormattedMessage
                    id='channel_settings.activity_warning.title'
                    defaultMessage='Channel Activity Warning'
                />
            }
            handleCancel={onClose}
            handleConfirm={handleConfirm}
            confirmButtonText={
                <FormattedMessage
                    id='channel_settings.activity_warning.continue'
                    defaultMessage='Continue with Changes'
                />
            }
            cancelButtonText={
                <FormattedMessage
                    id='channel_settings.activity_warning.cancel'
                    defaultMessage='Cancel'
                />
            }
            autoCloseOnConfirmButton={false}
            autoCloseOnCancelButton={false}
            compassDesign={true}
            isStacked={true}
        >
            <div className='channel-activity-warning-content'>
                <div className='warning-header'>
                    <i className='icon icon-alert-outline warning-icon'/>
                    <div className='warning-title'>
                        <FormattedMessage
                            id='channel_settings.activity_warning.message'
                            defaultMessage='Changing access rules after channel activity'
                        />
                    </div>
                </div>

                <div className='warning-description'>
                    <FormattedMessage
                        id='channel_settings.activity_warning.description'
                        defaultMessage='There has been activity in "{channelName}" since the last access rule change. Modifying access rules now might allow new users to see previous chat history.'
                        values={{channelName}}
                    />
                </div>

                {activityDelta && (
                    <div className='activity-summary'>
                        {activityDelta.new_messages > 0 && (
                            <div className='activity-item'>
                                <FormattedMessage
                                    id='channel_settings.activity_warning.new_messages'
                                    defaultMessage='<strong>{count}</strong> new messages since last rule change'
                                    values={{
                                        count: activityDelta.new_messages,
                                        strong: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
                                    }}
                                />
                            </div>
                        )}
                        {activityDelta.new_members > 0 && (
                            <div className='activity-item'>
                                <FormattedMessage
                                    id='channel_settings.activity_warning.new_members'
                                    defaultMessage='<strong>{count}</strong> new members joined'
                                    values={{
                                        count: activityDelta.new_members,
                                        strong: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
                                    }}
                                />
                            </div>
                        )}
                        {activityDelta.last_activity_at > 0 && (
                            <div className='activity-item'>
                                <FormattedMessage
                                    id='channel_settings.activity_warning.last_activity'
                                    defaultMessage='Last activity: <strong>{time}</strong>'
                                    values={{
                                        time: formatActivityTime(activityDelta.last_activity_at),
                                        strong: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
                                    }}
                                />
                            </div>
                        )}
                    </div>
                )}

                <div className='dont-show-again-container'>
                    <div className='dont-show-again-checkbox-container'>
                        <input
                            type='checkbox'
                            id='dontShowAgainCheckbox'
                            className='dont-show-again-checkbox'
                            checked={dontShowAgain}
                            onChange={(e) => setDontShowAgain(e.target.checked)}
                        />
                        <label
                            htmlFor='dontShowAgainCheckbox'
                            className='dont-show-again-label'
                        >
                            <span className='dont-show-again-text'>
                                <FormattedMessage
                                    id='channel_settings.activity_warning.dont_show_again'
                                    defaultMessage="Don't show this warning again"
                                />
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        </GenericModal>
    );
};

export default ChannelActivityWarningModal;
