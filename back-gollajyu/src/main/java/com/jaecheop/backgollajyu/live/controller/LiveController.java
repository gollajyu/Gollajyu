package com.jaecheop.backgollajyu.live.controller;

import com.jaecheop.backgollajyu.live.model.LiveDetailResDto;
import com.jaecheop.backgollajyu.live.model.LiveListDto;
import com.jaecheop.backgollajyu.live.model.LiveStartReqDto;
import com.jaecheop.backgollajyu.live.model.VoteRequestDto;
import com.jaecheop.backgollajyu.live.service.LiveService;
import com.jaecheop.backgollajyu.vote.model.ResponseMessage;
import com.jaecheop.backgollajyu.vote.model.ServiceResult;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/lives")
public class LiveController {

    private final LiveService liveService;

    @Value("${file.dir}")
    private String fileDir;

    @PostMapping("")
    @Operation(summary = "라이브 방송 생성", description = "No body")
    public ResponseEntity<ResponseMessage<?>> startLive(LiveStartReqDto liveStartReqDto) {
        ServiceResult<?> result = liveService.startLive(liveStartReqDto, fileDir);

        ResponseMessage<?> responseMessage = new ResponseMessage<>();

        if (!result.isResult()) {
            return ResponseEntity.ok().body(responseMessage.fail(result.getMessage()));
        }

        return ResponseEntity.ok().body(responseMessage.success());
    }

//    @GetMapping("")
//    @Operation(summary = "라이브 방송 리스트 조회", description = "returns LiveListDto")
//    public ResponseEntity<ResponseMessage<List<LiveListDto>>> listLive() {
//        ServiceResult<List<LiveListDto>> result = liveService.findAllLives();
//
//        ResponseMessage<List<LiveListDto>> responseMessage = new ResponseMessage<>();
//        if (!result.isResult()) {
//            return ResponseEntity.ok().body(responseMessage.fail(result.getMessage()));
//        }
//
//        return ResponseEntity.ok().body(responseMessage.success(result.getData()));
//    }

    @GetMapping("/listWithTop3")
    @Operation(summary = "라이브 방송 리스트 조회 (상위 3개 포함)", description = "시청자 수가 많은 상위 3개 라이브 방송과 나머지를 최신순으로 조회합니다.")
    public ResponseEntity<ResponseMessage<List<LiveListDto>>> listLiveWithTop3() {
        List<LiveListDto> liveList = liveService.findAllLivesWithTop3();
        return ResponseEntity.ok(new ResponseMessage<List<LiveListDto>>().success(liveList));
    }

    @DeleteMapping("/{sessionId}")
    @Operation(summary = "라이브 방송 삭제", description = "No body")
    public ResponseEntity<ResponseMessage<Void>> deleteLive(@PathVariable Long sessionId) {
        ServiceResult<Void> result = liveService.deleteLiveRoom(sessionId);

        ResponseMessage<Void> responseMessage = new ResponseMessage<>();
        if (!result.isResult()) {
            return ResponseEntity.ok().body(responseMessage.fail(result.getMessage()));
        }

        return ResponseEntity.ok().body(responseMessage.success());
    }

    @GetMapping("/{liveId}")
    @Operation(summary = "라이브 방송 상세 조회", description = "returns LiveDetailDto")
    public ResponseEntity<ResponseMessage<LiveDetailResDto>> detailLive(@PathVariable Long liveId) {
        ServiceResult<LiveDetailResDto> result = liveService.findLiveDetail(liveId);

        ResponseMessage<LiveDetailResDto> responseMessage = new ResponseMessage<>();
        if (!result.isResult()) {
            return ResponseEntity.ok().body(responseMessage.fail(result.getMessage()));
        }

        return ResponseEntity.ok().body(responseMessage.success(result.getData()));
    }

    @PostMapping("/{liveId}/enter/{memberId}")
    @Operation(summary = "라이브 방송 입장", description = "No body")
    public ResponseEntity<ResponseMessage<Void>> enterLive(@PathVariable Long liveId, @PathVariable Long memberId) {
        ServiceResult<Void> result = liveService.enterLive(liveId, memberId);
        if (!result.isResult()) {
            // 실패한 경우
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new ResponseMessage<Void>().fail(result.getMessage()));
        }
        // 성공한 경우
        return ResponseEntity.ok().body(new ResponseMessage<Void>().success());
    }

    @PostMapping("/{liveId}/exit/{memberId}")
    @Operation(summary = "라이브 방송 퇴장", description = "No body")
    public ResponseEntity<ResponseMessage<Void>> exitLive(@PathVariable Long liveId, @PathVariable Long memberId) {
        ServiceResult<Void> result = liveService.exitLive(liveId, memberId);
        if (!result.isResult()) {
            // 실패한 경우
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ResponseMessage<Void>().fail(result.getMessage()));
        }
        // 성공한 경우
        return ResponseEntity.ok().body(new ResponseMessage<Void>().success());
    }

    @PostMapping("/vote")
    @Operation(summary = "라이브 방송 투표 참여 및 변경", description = "No body")
    public ResponseEntity<ResponseMessage<?>> voteForItem(@RequestBody VoteRequestDto voteRequest) {
        ServiceResult<?> result = liveService.voteForItem(voteRequest.getMemberId(), voteRequest.getLiveId(), voteRequest.getLiveVoteItemId());
        if (!result.isResult()) {
            return ResponseEntity.badRequest().body(new ResponseMessage<>().fail(result.getMessage()));
        }
        return ResponseEntity.ok(new ResponseMessage<>().success(result.getMessage()));
    }

}
