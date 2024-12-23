package com.ssafy11.api.controller;

import com.ssafy11.api.service.GptService;
import com.ssafy11.domain.common.PageDto;
import com.ssafy11.domain.events.dto.EventCommand;
import com.ssafy11.api.service.EventService;
import com.ssafy11.domain.events.dto.Event;
import com.ssafy11.domain.common.PageResponse;
import com.ssafy11.domain.events.dto.recommendAmount;
import com.ssafy11.domain.participant.dto.EventParticipant;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.*;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final GptService gptService;

    @PostMapping //이벤트 추가
    public ResponseEntity<Integer> addEvent(@AuthenticationPrincipal User user,
                                      @RequestBody EventCommand event) {
        Assert.notNull(event, "Event must not be null");

        Integer eventId = eventService.addEvent(event, user.getUsername());
        return ResponseEntity.ok(eventId);
    }

    @PatchMapping ("/{eventId}")//이벤트 수정
    public ResponseEntity<Integer> updateEvent(@AuthenticationPrincipal User user,
                                         @RequestBody EventCommand event,
                                         @PathVariable ("eventId") Integer eventId) {
        Assert.notNull(event, "Event must not be null");
        Assert.notNull(eventId, "Event ID must not be null");
        int returnId = eventService.updateEvent(event, eventId,user.getUsername());
        return ResponseEntity.ok(returnId);
    }

    @GetMapping//이벤트 목록
    public ResponseEntity<PageResponse<Event>> getAllEvents(@AuthenticationPrincipal User user,
                                          @ModelAttribute PageDto pagedto) {
        PageResponse<Event> events = eventService.getEvents(user.getUsername(), pagedto);
        return ResponseEntity.ok(events);
    }

    //이벤트 상세 목록(해당 이벤트 경조사 내역)
    @GetMapping("/detail/{eventId}")
    public ResponseEntity<PageResponse<EventParticipant>> getEvent(@AuthenticationPrincipal User user,
                                      @PathVariable("eventId") Integer eventId,
                                      @ModelAttribute PageDto pagedto) {
        Assert.notNull(eventId, "eventId must not be null");

        PageResponse<EventParticipant> guests = eventService.getEvent(user.getUsername(), eventId, pagedto);
        return ResponseEntity.ok(guests);
    }

    //이벤트 삭제
    @DeleteMapping("/{eventId}")
    public ResponseEntity<Integer> deleteEvent(@AuthenticationPrincipal User user,
                                               @PathVariable("eventId") Integer eventId) {
        Assert.notNull(eventId, "eventId must not be null");
        Integer resultId = eventService.deleteEvent(eventId, user.getUsername());
        return ResponseEntity.ok(resultId);
    }

    //자체 금액 추천
    @GetMapping("recommend/money")
    public ResponseEntity<recommendAmount> getEventRecommend(@AuthenticationPrincipal User user,
                                             @RequestParam ("category") String category) {
        Assert.hasText(category, "category must not be null");
        recommendAmount recommendAmount = eventService.getRecommendAmount(category, user.getUsername());
        return ResponseEntity.ok(recommendAmount);
    }

    //경조사 AI 축하 메시지 추천
    @PostMapping("/ai/recommend/message")
    public ResponseEntity<String> aiMessage(@RequestBody String gptQuotes) {
        Assert.hasText(gptQuotes, "gptResponse must not be null");

        String gptMoney = gptService.getChatResponse(gptQuotes, 0);

        return ResponseEntity.ok(gptMoney);
    }

    //AI 금액 추천
    @PostMapping("/ai/recommend/money")
    public ResponseEntity<String> aiAmount(@RequestBody String gptQuotes) {
        Assert.hasText(gptQuotes, "gptResponse must not be null");
        String gptMoney = gptService.getChatResponse(gptQuotes, 1);

        return ResponseEntity.ok(gptMoney);
    }

}
