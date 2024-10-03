package com.ssafy11.api.controller;

import com.ssafy11.api.dto.account.*;
import com.ssafy11.api.dto.pay.PayHistoryDTO;
import com.ssafy11.api.service.AccountService;
import com.ssafy11.domain.Account.Account;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.userdetails.User;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class AccountController {

    private final AccountService accountService;

    // 1. 계좌 만들기
    @PostMapping("/account")
    public ResponseEntity<Account> createAccount(
            @AuthenticationPrincipal User user,
            @RequestBody BankCodeDTO bankCodeDTO) {
        int authenticatedUserId = Integer.parseInt(user.getUsername());
        Account createdAccount = accountService.createAccount(authenticatedUserId, bankCodeDTO.getBankCode());
        return ResponseEntity.ok(createdAccount);
    }

    // 2. 내 계좌 등록하기
    @PostMapping("/users/account")
    public ResponseEntity<Account> registerAccount(
            @AuthenticationPrincipal User user,
            @RequestBody AccountNumberRequest accountNumber) {
        int authenticatedUserId = Integer.parseInt(user.getUsername());
        Account registeredAccount = accountService.connectAccount(authenticatedUserId, accountNumber.accountNumber());
        return ResponseEntity.ok(registeredAccount);
    }

    // 3. 내 계좌 보기
    @GetMapping("/users/account")
    public ResponseEntity<List<Account>> viewAccounts(
            @AuthenticationPrincipal User user,
            @RequestParam(value = "bankCode", required = false) String bankCode) {
        int authenticatedUserId = Integer.parseInt(user.getUsername());
        List<Account> accounts = accountService.findAllAccounts(authenticatedUserId, bankCode);
        return ResponseEntity.ok(accounts);
    }

    // 4. 연결 계좌 정보 보기
    @GetMapping("/users/account/info")
    public ResponseEntity<Account> viewConnectedAccountInfo(
            @AuthenticationPrincipal User user) {
        int authenticatedUserId = Integer.parseInt(user.getUsername());
        Account connectedAccount = accountService.connectedAccount(authenticatedUserId);
        return ResponseEntity.ok(connectedAccount);
    }

    // 5. 계좌 잔액 충전
    @PostMapping("/account/{account_number}/charge")
    public ResponseEntity<PayHistoryDTO> chargeBalance(
            @PathVariable("account_number") String accountNumber,
            @RequestBody ChargePayAmountRequest request) {
        PayHistoryDTO payHistory = accountService.chargeBalance(accountNumber, request.amount());
        return ResponseEntity.ok(payHistory);
    }

    // 6. 송금하기
    @PostMapping("/account/{sender_account_number}/send")
    public ResponseEntity<PayHistoryDTO> sendMoney(
            @PathVariable("sender_account_number") String senderAccountNumber,
            @RequestBody SendPayMoneyRequest request) {
        PayHistoryDTO payHistoryDTO = accountService.sendMoney(senderAccountNumber, request.info(), request.targetAccountNumber(), request.amount());
        return ResponseEntity.ok(payHistoryDTO);
    }

    // 7. 거래 내역 조회
    @GetMapping("/account/{account_number}/history")
    public ResponseEntity<List<PayHistoryDTO>> getPayHistory(
            @PathVariable("account_number") String accountNumber,
            @RequestParam(value = "start_date", required = false) LocalDate startDate,
            @RequestParam(value = "end_date", required = false) LocalDate endDate,
            @RequestParam(value = "pay_type", required = false) String payType) {
        List<PayHistoryDTO> payHistoryList = accountService.findPayHistory(accountNumber, startDate, endDate, payType);
        return ResponseEntity.ok(payHistoryList);
    }

}