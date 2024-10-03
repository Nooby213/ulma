package com.ssafy11.domain.Pay;

import com.ssafy11.domain.Account.Account;

import java.time.LocalDate;
import java.util.List;


public interface PayDao {
    // 계좌 생성
    Account createPayAccount(Integer userId);

    // 얼마페이 계좌 충전
    PayHistory chargePayBalance(Integer accountId, Long amount);

    // 얼마페이 계좌에서 다른 계좌로 송금
    PayHistory sendPayMoney(Integer userId, String info,  String targetAccountNumber, Long amount);

    List<PayHistory> findPayHistory(Integer userId, LocalDate startDate, LocalDate endDate, String payType);
    Account findPayAccountByUserId(Integer userId);
}