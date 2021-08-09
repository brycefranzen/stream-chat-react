import React from 'react';
import {
  Avatar,
  ChannelList,
  ChannelListMessengerProps,
  ChannelPreviewUIComponentProps,
  useChatContext,
} from 'stream-chat-react';

import { DMChannel } from './DMChannel';
import { EmptyStateIndicators } from './EmptyStateIndicators';
import { ParticipantSearch } from './ParticipantSearch';
import { getFormattedTime } from './utils';

import { ClickDMIcon } from '../../assets';
import { useEventContext } from '../../contexts/EventContext';

import type {
  Channel as StreamChannel,
  ChannelFilters,
  ChannelOptions,
  ChannelSort,
  UserResponse,
} from 'stream-chat';

const filters: ChannelFilters = { type: 'messaging', demo: 'virtual-event' };
const options: ChannelOptions = { state: true, presence: true, limit: 10 };
const sort: ChannelSort = { last_message_at: -1 };

export const SkeletonLoader: React.FC = () => (
  <ul className='dm-loading'>
    {[0, 1, 2, 3, 4].map((_, i) => (
      <li key={i}>
        <div className='dm-loading-avatar'></div>
        <div className='dm-loading-text'>
          <div></div>
          <div></div>
        </div>
      </li>
    ))}
  </ul>
);

const ListWrapper: React.FC = ({ children }) => {
  return <div className='dm-list'>{children}</div>;
};

const ListUI: React.FC<ChannelListMessengerProps> = (props) => {
  const { children, error, loading } = props;

  if (loading) {
    return (
      <ListWrapper>
        <SkeletonLoader />
      </ListWrapper>
    );
  }

  if (error) {
    return (
      <ListWrapper>
        <div className='dm-error'>
          Error fetching direct messages, please try again momentarily.
        </div>
      </ListWrapper>
    );
  }

  return <ListWrapper>{children}</ListWrapper>;
};

const PreviewUI: React.FC<
  ChannelPreviewUIComponentProps & {
    setDmChannel: React.Dispatch<React.SetStateAction<StreamChannel | undefined>>;
  }
> = (props) => {
  const { channel, displayImage, displayTitle, latestMessage, setDmChannel } = props;

  const { client } = useChatContext();

  const secondsSinceLastMessage = channel.state?.last_message_at
    ? (Date.now() - channel.state.last_message_at.getTime()) / 1000
    : 0;

  const formattedTime = getFormattedTime(secondsSinceLastMessage);

  const [fallbackName] = Object.keys(channel.state.members).filter((id) => id !== client.userID);

  return (
    <div className='dm-list-preview' onClick={() => setDmChannel(channel)}>
      <Avatar image={displayImage} name={fallbackName} />
      <div>
        <div className='dm-list-preview-top'>
          <div>{displayTitle}</div>
          <div>{formattedTime}</div>
        </div>
        <div className='dm-list-preview-bottom'>{latestMessage}</div>
      </div>
      <ClickDMIcon />
    </div>
  );
};

type Props = {
  setDmChannel: React.Dispatch<React.SetStateAction<StreamChannel | undefined>>;
  setParticipantProfile: React.Dispatch<React.SetStateAction<UserResponse | undefined>>;
  dmChannel?: StreamChannel;
};

export const DMChannelList: React.FC<Props> = (props) => {
  const { dmChannel, setParticipantProfile, setDmChannel } = props;

  const { searching, setSearching } = useEventContext();

  return (
    <>
      {searching && (
        <ParticipantSearch
          setDmChannel={setDmChannel}
          setParticipantProfile={setParticipantProfile}
          setSearching={setSearching}
        />
      )}
      <div className='dm'>
        {dmChannel && <DMChannel dmChannel={dmChannel} setDmChannel={setDmChannel} />}
        <div className={dmChannel ? 'dm-hidden' : ''}>
          <ChannelList
            EmptyStateIndicator={EmptyStateIndicators}
            filters={filters}
            List={ListUI}
            options={options}
            Preview={(props) => <PreviewUI {...props} setDmChannel={setDmChannel} />}
            sort={sort}
          />
          <div className='start-chat'>
            <div className='start-chat-button' onClick={() => setSearching(true)}>
              Start a chat
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
