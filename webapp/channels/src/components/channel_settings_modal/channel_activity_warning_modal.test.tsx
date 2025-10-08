// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {screen, fireEvent} from '@testing-library/react';
import React from 'react';

import {renderWithContext} from 'tests/react_testing_utils';

import ChannelActivityWarningModal from './channel_activity_warning_modal';

describe('ChannelActivityWarningModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
        onDontShowAgain: jest.fn(),
        channelName: 'Test Channel',
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render modal when open', () => {
        renderWithContext(<ChannelActivityWarningModal {...defaultProps}/>);

        expect(screen.getByText('Channel Activity Warning')).toBeInTheDocument();
        expect(screen.getByText(/There has been activity in "Test Channel"/)).toBeInTheDocument();
        expect(screen.getByText('Continue with Changes')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should not render modal when closed', () => {
        renderWithContext(
            <ChannelActivityWarningModal
                {...defaultProps}
                isOpen={false}
            />,
        );

        expect(screen.queryByText('Channel Activity Warning')).not.toBeInTheDocument();
    });

    it('should display activity delta information when provided', () => {
        const activityDelta = {
            new_messages: 25,
            new_members: 3,
            last_activity_at: Date.now() - (3 * 60 * 60 * 1000), // 3 hours ago
        };

        renderWithContext(
            <ChannelActivityWarningModal
                {...defaultProps}
                activityDelta={activityDelta}
            />,
        );

        expect(screen.getByText('25')).toBeInTheDocument();
        expect(screen.getByText('new messages since last rule change')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('new members joined')).toBeInTheDocument();
        expect(screen.getByText('Last activity:')).toBeInTheDocument();
        expect(screen.getByText('3 hours ago')).toBeInTheDocument();
    });

    it('should format time correctly for minutes', () => {
        const activityDelta = {
            new_messages: 5,
            new_members: 0,
            last_activity_at: Date.now() - (30 * 60 * 1000), // 30 minutes ago
        };

        renderWithContext(
            <ChannelActivityWarningModal
                {...defaultProps}
                activityDelta={activityDelta}
            />,
        );

        expect(screen.getByText('Last activity:')).toBeInTheDocument();
        expect(screen.getByText('30 minutes ago')).toBeInTheDocument();
    });

    it('should format time correctly for days', () => {
        const activityDelta = {
            new_messages: 100,
            new_members: 2,
            last_activity_at: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
        };

        renderWithContext(
            <ChannelActivityWarningModal
                {...defaultProps}
                activityDelta={activityDelta}
            />,
        );

        expect(screen.getByText('Last activity:')).toBeInTheDocument();
        expect(screen.getByText('2 days ago')).toBeInTheDocument();
    });

    it('should call onClose when cancel button is clicked', () => {
        renderWithContext(<ChannelActivityWarningModal {...defaultProps}/>);

        fireEvent.click(screen.getByText('Cancel'));

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onConfirm when continue button is clicked without checkbox', () => {
        renderWithContext(<ChannelActivityWarningModal {...defaultProps}/>);

        fireEvent.click(screen.getByText('Continue with Changes'));

        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
        expect(defaultProps.onDontShowAgain).not.toHaveBeenCalled();
    });

    it('should call onDontShowAgain and onConfirm when continue with checkbox checked', () => {
        renderWithContext(<ChannelActivityWarningModal {...defaultProps}/>);

        // Check the "Don't show again" checkbox
        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        // Click continue
        fireEvent.click(screen.getByText('Continue with Changes'));

        expect(defaultProps.onDontShowAgain).toHaveBeenCalledTimes(1);
        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should toggle checkbox state when clicked', () => {
        renderWithContext(<ChannelActivityWarningModal {...defaultProps}/>);

        const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
        expect(checkbox.checked).toBe(false);

        fireEvent.click(checkbox);
        expect(checkbox.checked).toBe(true);

        fireEvent.click(checkbox);
        expect(checkbox.checked).toBe(false);
    });

    it('should show warning icon and appropriate styling', () => {
        renderWithContext(<ChannelActivityWarningModal {...defaultProps}/>);

        const warningIcon = screen.getByText('Changing access rules after channel activity').closest('.warning-header');
        expect(warningIcon).toBeInTheDocument();
        expect(warningIcon?.querySelector('.warning-icon')).toBeInTheDocument();
    });

    it('should not show activity summary when no activity delta provided', () => {
        renderWithContext(<ChannelActivityWarningModal {...defaultProps}/>);

        expect(screen.queryByText(/Last activity:/)).not.toBeInTheDocument();
        expect(screen.queryByText(/new messages since last rule change/)).not.toBeInTheDocument();
    });

    it('should show message count only when greater than 0', () => {
        const activityDelta = {
            new_messages: 0,
            new_members: 2,
            last_activity_at: Date.now() - (1 * 60 * 60 * 1000), // 1 hour ago
        };

        renderWithContext(
            <ChannelActivityWarningModal
                {...defaultProps}
                activityDelta={activityDelta}
            />,
        );

        expect(screen.getByText('Last activity:')).toBeInTheDocument();
        expect(screen.getByText('1 hour ago')).toBeInTheDocument();
        expect(screen.queryByText('new messages since last rule change')).not.toBeInTheDocument();
    });

    it('should not show new members section when new_members is 0', () => {
        const activityDelta = {
            new_messages: 5,
            new_members: 0,
            last_activity_at: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
        };

        renderWithContext(
            <ChannelActivityWarningModal
                {...defaultProps}
                activityDelta={activityDelta}
            />,
        );

        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('new messages since last rule change')).toBeInTheDocument();
        expect(screen.queryByText('new members joined')).not.toBeInTheDocument();
        expect(screen.getByText('Last activity:')).toBeInTheDocument();
        expect(screen.getByText('2 hours ago')).toBeInTheDocument();
    });

    it('should not show last activity when timestamp is 0', () => {
        const activityDelta = {
            new_messages: 5,
            new_members: 1,
            last_activity_at: 0,
        };

        renderWithContext(
            <ChannelActivityWarningModal
                {...defaultProps}
                activityDelta={activityDelta}
            />,
        );

        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('new messages since last rule change')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('new members joined')).toBeInTheDocument();
        expect(screen.queryByText('Last activity:')).not.toBeInTheDocument();
    });
});
