package com.ssafy11.domain.events;

import com.ssafy11.domain.common.PageDto;
import com.ssafy11.domain.events.dto.Event;
import com.ssafy11.domain.common.PageResponse;
import com.ssafy11.domain.events.dto.EventCommand;
import com.ssafy11.domain.events.dto.recommendAmount;
import com.ssafy11.domain.participant.dto.EventParticipant;
import lombok.RequiredArgsConstructor;
import org.jooq.DSLContext;
import org.jooq.Field;
import org.jooq.Record1;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.ssafy11.ulma.generated.Tables.*;

@Transactional
@RequiredArgsConstructor
@Repository
public class EventDaoImpl implements EventDao{

    private final DSLContext dsl;

    @Override
    public Integer addEvent(EventCommand event, Integer userId) {
        Record1<Integer> saveEvent = dsl.insertInto(EVENT, EVENT.NAME, EVENT.CATEGORY, EVENT.DATE, EVENT.USERS_ID, EVENT.CREATE_AT)
                .values(event.name(), event.category(), event.date(), userId, LocalDateTime.now())
                .returningResult(EVENT.ID)
                .fetchOne();

        Assert.notNull(saveEvent.getValue(EVENT.ID), "EVENT_ID 에 null 값은 허용되지 않음");
        return saveEvent.getValue(EVENT.ID);
    }

    @Override
    public Integer updateEvent(EventCommand event, Integer eventId) {

        Map<Field<?>, Object> updateMap = new HashMap<>();

        if(event.name()!=null) updateMap.put(EVENT.NAME, event.name());
        if(event.category()!=null) updateMap.put(EVENT.CATEGORY, event.category());
        if(event.date()!=null) updateMap.put(EVENT.DATE, event.date());

        int result = -1;
        if(!updateMap.isEmpty()){
            result = dsl.update(EVENT)
                    .set(updateMap)
                    .where(EVENT.ID.eq(eventId))
                    .execute();
        }
        Assert.isTrue(result==1, "이벤트 업데이트 실패 데이터 정보를 확인해주세요");
        return result;
    }

    @Override
    public Boolean isUserEventCreated(Integer eventId, Integer userId) {
        return dsl.fetchExists(
                dsl.selectOne()
                        .from(EVENT)
                        .where(EVENT.ID.eq(eventId))
                        .and(EVENT.USERS_ID.eq(userId))
        );
    }

    @Transactional(readOnly = true)
    @Override
    public PageResponse<Event> getEvents(Integer userId, PageDto pageDto) {
        int size = pageDto.getSize();
        int page = pageDto.getPage();

        int totalItems = dsl.fetchCount(dsl.selectFrom(EVENT).where(EVENT.USERS_ID.eq(userId)));
        int totalPages = (int) Math.ceil((double) totalItems/size);

        int offset = (page-1) * size;

        List<Event> result = dsl.select(EVENT.ID, EVENT.NAME, EVENT.CATEGORY, EVENT.DATE)
                .from(EVENT)
                .where(EVENT.USERS_ID.eq(userId))
                .limit(size)
                .offset(offset)
                .fetchInto(Event.class);

        return new PageResponse<>(result, page, totalItems, totalPages);
    }

    @Transactional(readOnly = true)
    @Override
    public PageResponse<EventParticipant> getEvent(Integer eventId, PageDto pageDto) {

        int size = pageDto.getSize();
        int page = pageDto.getPage();

        Integer count = dsl.selectCount()
                .from(PARTICIPATION)
                .join(GUEST)
                .on(GUEST.ID.eq(PARTICIPATION.GUEST_ID))
                .where(PARTICIPATION.EVENT_ID.eq(eventId))
                .fetchOne(0, Integer.class);

        int totalItems = (count != null) ? count : 0;
        int totalPages = (int) Math.ceil((double) totalItems/size);

        int offset = (page-1) * size;

        List<EventParticipant> result = dsl.select(GUEST.ID,GUEST.NAME,GUEST.CATEGORY, PARTICIPATION.AMOUNT)
                .from(PARTICIPATION)
                .join(GUEST)
                .on(GUEST.ID.eq(PARTICIPATION.GUEST_ID))
                .where(PARTICIPATION.EVENT_ID.eq(eventId))
                .limit(size)
                .offset(offset)
                .fetchInto(EventParticipant.class);

        return new PageResponse<>(result, page, totalItems, totalPages);
    }

    @Override
    public Integer getEventByUserId(Integer eventId) {
        Record1<Integer> eventUserId = dsl.select(EVENT.USERS_ID)
                .from(EVENT)
                .where(EVENT.ID.eq(eventId))
                .fetchOne();
        return eventUserId != null ? eventUserId.value1() : null;
    }

    @Override
    public Integer deleteEvent(Integer eventId, Integer userId) {
        Integer participationUpdateCount = dsl.update(PARTICIPATION)
                .set(PARTICIPATION.GUEST_ID, (Integer)null)
                .where(PARTICIPATION.EVENT_ID.eq(eventId))
                .and(PARTICIPATION.GUEST_ID.eq(userId))
                .execute();

        return dsl.update(EVENT)
                .set(EVENT.USERS_ID, (Integer)null)
                .where(EVENT.ID.eq(eventId))
                .execute();
    }

    @Transactional(readOnly = true)
    @Override
    public recommendAmount getRecommendAmount(String category, Integer userId) {
        return dsl.select(PAYMENT_ANALYSIS.UNDER_50K_RATIO,
                PAYMENT_ANALYSIS.BETWEEN_50K_100K_RATIO,
                PAYMENT_ANALYSIS.BETWEEN_100K_150K_RATIO,
                PAYMENT_ANALYSIS.ABOVE_150K_RATIO,
                PAYMENT_ANALYSIS.MIN_AMOUNT,
                PAYMENT_ANALYSIS.MAX_AMOUNT,
                PAYMENT_ANALYSIS.TOP_AMOUNT)
                .from(PAYMENT_ANALYSIS)
                .where(PAYMENT_ANALYSIS.CATEGORY.eq(category))
                .orderBy(PAYMENT_ANALYSIS.CREATE_AT.desc())
                .limit(1)
                .fetchOneInto(recommendAmount.class);
    }
}
