import serial
import time
import threading
import subprocess
import sys

# 시리얼 포트 설정
ser = serial.Serial(
    port='/dev/ttyS0',
    baudrate=115200,
    timeout=1
)

filename = 'aaa.py'
current_process = None  # 현재 실행 중인 프로세스 저장

def run_code(filename):
    global current_process  # 전역 변수 접근
    try:
        if current_process is not None:
            # 이전 프로세스 종료
            current_process.terminate()
            current_process.wait()
            print('Previous process terminated.')

        process = subprocess.Popen(['python3', filename], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
        current_process = process  # 현재 실행 중인 프로세스 업데이트

        for line in iter(process.stdout.readline, ''):
            if line:
                print(line, end='')  # 화면에 출력
                ser.write(line.encode('utf-8'))  # 시리얼 포트로 전송

        process.stdout.close()
        process.wait()
    except Exception as e:
        error_message = f"Error: {str(e)}"
        print(error_message)
        ser.write(error_message.encode('utf-8'))

while True:
    lines = ser.readlines()
    print(lines)
    for line in lines:
        if '###END###' in line.decode('utf-8'):
            # 현재 실행 중인 프로세스 종료
            if current_process is not None:
                print('Terminating current process.')
                current_process.terminate()
                current_process.wait()
            break  # 다음 라인으로 이동하여 새 코드를 읽지 않도록 함

    if len(lines) > 0:
        with open(filename, 'w') as file:
            file.write('# -*- coding: utf-8 -*-\n')
            for line in lines:
                decoded_line = line.decode('utf-8')
                file.write(decoded_line)
        print('File save ok')

        # 현재 실행 중인 프로세스가 없으면 실행
        if current_process is None:
            run_code(filename)

