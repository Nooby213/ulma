package com.ssafy11.api.service;

import com.ssafy11.api.exception.ErrorCode;
import com.ssafy11.api.exception.ErrorException;
import com.ssafy11.domain.common.PageDto;
import com.ssafy11.domain.events.dto.EventCommand;
import com.ssafy11.domain.events.EventDao;
import com.ssafy11.domain.events.dto.Event;
import com.ssafy11.domain.common.PageResponse;
import com.ssafy11.domain.participant.dto.EventParticipant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

@Service
@RequiredArgsConstructor
@Transactional
public class EventService {
    private final EventDao eventDao;

    public Integer addEvent(EventCommand event) {
        Assert.notNull(event, "Event must not be null");
        Integer eventId = eventDao.addEvent(event);
        Assert.notNull(eventId, "Event id must not be null");
        return eventId;
    }

    public boolean isUserEventCreated(final Integer eventId, final Integer userId) {
        Assert.notNull(eventId, "eventId is required");
        Assert.notNull(userId, "userId is required");
        return eventDao.isUserEventCreated(eventId, userId);
    }

    public Integer updateEvent(EventCommand event, Integer eventId) {
        Assert.notNull(event, "Event must not be null");
        Assert.notNull(eventId, "EventId must not be null");

        Assert.isTrue(isUserEventCreated(eventId, event.userId()), "사용자가 만든 이벤트가 아닙니다.");

        Integer resultId = eventDao.updateEvent(event, eventId);
        Assert.notNull(eventId, "Event id must not be null");
        return resultId;
    }

    @Transactional(readOnly = true)
    public PageResponse<Event> getEvents(Integer userId, PageDto pageDto) {
        Assert.notNull(userId, "User must not be null");

        PageResponse<Event> EventsList = eventDao.getEvents(userId, pageDto);
        Assert.notNull(EventsList, "Events list must not be null");
        return EventsList;

    }

    @Transactional(readOnly = true)
    public PageResponse<EventParticipant> getEvent(Integer userId, Integer eventId, PageDto pageDto) {
        Assert.notNull(eventId, "Event must not be null");

        Assert.isTrue(userId.equals(eventDao.getEventByUserId(eventId)), "유저가 만든 이벤트가 아닙니다.");

        PageResponse<EventParticipant> guestsList = eventDao.getEvent(eventId, pageDto);
        Assert.notNull(guestsList, "Guests list must not be null");
        return guestsList;
    }

}