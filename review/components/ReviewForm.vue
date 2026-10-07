<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// 状态管理
const currentStep = ref(1) // 1: 登录 2: 填写题目 3: 结果
const isLoggedIn = ref(false)
const isLoading = ref(false)
const verificationCode = ref('')
const verificationSent = ref(false)
const countdown = ref(0)

// 用户信息
const userInfo = ref({
  qq: '',
  username: '',
  mcUsername: '',
  email: ''
})

// 表单数据
const formData = ref({
  answers: {} as Record<string, string | string[]>
})

// 审核结果
const reviewResult = ref<{
  passed: boolean
  reason: string
  code?: string
  groupNumber?: string
} | null>(null)

// 审核题目数据 (从API获取)
const questions = ref([
  {
    id: 'q1',
    type: 'single',
    question: '服务器的 Forge 版本是多少？',
    options: ['1.20.1', '1.20.4', '1.21.1', '1.21.3'],
    required: true
  },
  {
    id: 'q2',
    type: 'multiple',
    question: '以下哪些是服务器的核心玩法？',
    options: ['领地保护', '经济系统', '宠物系统', 'PVP竞技场', '挂机经验'],
    required: true
  },
  {
    id: 'q3',
    type: 'fill',
    question: '服务器的公开群号是多少？',
    required: true
  },
  {
    id: 'q4',
    type: 'single',
    question: '如何防止自己的物品被其他玩家偷窃？',
    options: ['使用锁链箱子', '设置重生点', '隐藏坐标', '不停切换账号'],
    required: true
  },
  {
    id: 'q5',
    type: 'fill',
    question: '你的游戏ID（创建的角色的名字）是什么？',
    required: true
  }
])

// 计算属性
const canSubmit = computed(() => {
  const requiredQuestions = questions.value.filter(q => q.required)
  return requiredQuestions.every(q => {
    const answer = formData.value.answers[q.id]
    if (q.type === 'multiple') {
      return Array.isArray(answer) && answer.length > 0
    }
    return answer && (answer as string).trim() !== ''
  })
})

const answeredCount = computed(() => {
  const requiredQuestions = questions.value.filter(q => q.required)
  return requiredQuestions.filter(q => {
    const answer = formData.value.answers[q.id]
    if (q.type === 'multiple') {
      return Array.isArray(answer) && answer.length > 0
    }
    return answer && (answer as string).trim() !== ''
  }).length
})

// 方法
const sendVerificationCode = async () => {
  if (!userInfo.value.qq || !/^\d{5,11}$/.test(userInfo.value.qq)) {
    alert('请输入有效的QQ号码')
    return
  }

  isLoading.value = true
  try {
    // TODO: 调用发送验证码API
    // await api.sendVerificationCode(userInfo.value.qq)

    verificationSent.value = true
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)

    alert('验证码已发送，请注意查收')
  } catch (error) {
    alert('发送验证码失败，请重试')
  } finally {
    isLoading.value = false
  }
}

const handleLogin = async () => {
  if (!verificationCode.value || verificationCode.value.length !== 6) {
    alert('请输入6位验证码')
    return
  }

  isLoading.value = true
  try {
    // TODO: 调用登录/绑定API
    // const result = await api.loginWithQQ(userInfo.value.qq, verificationCode.value)

    // 模拟登录成功
    isLoggedIn.value = true
    currentStep.value = 2

    // 存储用户信息
    userInfo.value.username = `User_${userInfo.value.qq.slice(-4)}`
  } catch (error) {
    alert('验证码错误或已过期，请重试')
  } finally {
    isLoading.value = false
  }
}

const handleSingleChange = (questionId: string, answer: string) => {
  formData.value.answers[questionId] = answer
}

const handleMultipleChange = (questionId: string, option: string, checked: boolean) => {
  const current = formData.value.answers[questionId] as string[] || []
  if (checked) {
    formData.value.answers[questionId] = [...current, option]
  } else {
    formData.value.answers[questionId] = current.filter(o => o !== option)
  }
}

const handleFillChange = (questionId: string, answer: string) => {
  formData.value.answers[questionId] = answer
}

const submitReview = async () => {
  if (!canSubmit.value) {
    alert('请完成所有必填题目')
    return
  }

  isLoading.value = true
  try {
    // TODO: 调用AI审核API
    // const result = await api.submitReview({
    //   qq: userInfo.value.qq,
    //   answers: formData.value.answers
    // })

    // 模拟AI审核结果
    const mockResult = Math.random() > 0.3
    reviewResult.value = mockResult
      ? {
          passed: true,
          reason: '答案符合服务器规范，继续保持！',
          code: Math.random().toString(36).substring(2, 8).toUpperCase(),
          groupNumber: '1234567890'
        }
      : {
          passed: false,
          reason: '请仔细阅读服务器规则文档，特别是关于领地保护和经济系统的部分。'
        }

    currentStep.value = 3
  } catch (error) {
    alert('提交失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  currentStep.value = 1
  isLoggedIn.value = false
  formData.value.answers = {}
  reviewResult.value = null
  verificationCode.value = ''
  verificationSent.value = false
}

const goToReview = () => {
  currentStep.value = 2
}

onMounted(() => {
  // TODO: 检查本地存储的登录状态
  // const savedUser = localStorage.getItem('review_user')
  // if (savedUser) {
  //   userInfo.value = JSON.parse(savedUser)
  //   isLoggedIn.value = true
  //   currentStep.value = 2
  // }
})
</script>

<template>
  <div class="review-container">
    <!-- 步骤指示器 -->
    <div class="steps-indicator">
      <div class="step" :class="{ active: currentStep >= 1, completed: currentStep > 1 }">
        <div class="step-number">1</div>
        <div class="step-label">绑定QQ</div>
      </div>
      <div class="step-line" :class="{ active: currentStep > 1 }"></div>
      <div class="step" :class="{ active: currentStep >= 2, completed: currentStep > 2 }">
        <div class="step-number">2</div>
        <div class="step-label">填写审核</div>
      </div>
      <div class="step-line" :class="{ active: currentStep > 2 }"></div>
      <div class="step" :class="{ active: currentStep >= 3 }">
        <div class="step-number">3</div>
        <div class="step-label">审核结果</div>
      </div>
    </div>

    <!-- 步骤1: 登录/绑定QQ -->
    <div v-if="currentStep === 1" class="step-content login-step">
      <div class="login-card">
        <div class="login-header">
          <div class="login-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <h2>绑定QQ账号</h2>
          <p>请输入QQ号码以便接收审核结果通知</p>
        </div>

        <div class="login-form">
          <div class="form-group">
            <label>QQ号码</label>
            <input
              v-model="userInfo.qq"
              type="text"
              placeholder="请输入你的QQ号码"
              maxlength="11"
              :disabled="verificationSent"
            />
          </div>

          <div v-if="verificationSent" class="form-group">
            <label>验证码</label>
            <input
              v-model="verificationCode"
              type="text"
              placeholder="请输入6位验证码"
              maxlength="6"
            />
            <div class="countdown-hint">
              <span v-if="countdown > 0">重新发送 ({{ countdown }}s)</span>
              <a v-else href="#" @click.prevent="sendVerificationCode">重新发送验证码</a>
            </div>
          </div>

          <button
            v-if="!verificationSent"
            class="btn-primary"
            :disabled="isLoading || !userInfo.qq"
            @click="sendVerificationCode"
          >
            {{ isLoading ? '发送中...' : '获取验证码' }}
          </button>

          <button
            v-else
            class="btn-primary"
            :disabled="isLoading || verificationCode.length !== 6"
            @click="handleLogin"
          >
            {{ isLoading ? '验证中...' : '确认绑定' }}
          </button>
        </div>

        <div class="login-tip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span>绑定成功后，审核结果将通过QQ自动发送给你</span>
        </div>
      </div>
    </div>

    <!-- 步骤2: 填写审核题目 -->
    <div v-if="currentStep === 2" class="step-content questions-step">
      <div class="questions-header">
        <h2>审核试题</h2>
        <div class="progress-info">
          <span>已完成 {{ answeredCount }} / {{ questions.filter(q => q.required).length }} 题</span>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${(answeredCount / questions.filter(q => q.required).length) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>

      <div class="questions-list">
        <div
          v-for="(question, index) in questions"
          :key="question.id"
          class="question-card"
          :class="{ answered: formData.answers[question.id] }"
        >
          <div class="question-header">
            <span class="question-number">第{{ index + 1 }}题</span>
            <span class="question-type">
              {{ question.type === 'single' ? '单选' : question.type === 'multiple' ? '多选' : '填空' }}
            </span>
            <span v-if="question.required" class="required-tag">必填</span>
          </div>

          <div class="question-content">{{ question.question }}</div>

          <!-- 单选题 -->
          <div v-if="question.type === 'single'" class="options-list">
            <label
              v-for="option in question.options"
              :key="option"
              class="option-item"
              :class="{ selected: formData.answers[question.id] === option }"
            >
              <input
                type="radio"
                :name="question.id"
                :value="option"
                :checked="formData.answers[question.id] === option"
                @change="handleSingleChange(question.id, option)"
              />
              <span class="option-radio"></span>
              <span class="option-text">{{ option }}</span>
            </label>
          </div>

          <!-- 多选题 -->
          <div v-if="question.type === 'multiple'" class="options-list">
            <label
              v-for="option in question.options"
              :key="option"
              class="option-item"
              :class="{ selected: (formData.answers[question.id] as string[] || []).includes(option) }"
            >
              <input
                type="checkbox"
                :checked="(formData.answers[question.id] as string[] || []).includes(option)"
                @change="handleMultipleChange(question.id, option, ($event.target as HTMLInputElement).checked)"
              />
              <span class="option-checkbox"></span>
              <span class="option-text">{{ option }}</span>
            </label>
          </div>

          <!-- 填空题 -->
          <div v-if="question.type === 'fill'" class="fill-input">
            <input
              type="text"
              :value="formData.answers[question.id] || ''"
              @input="handleFillChange(question.id, ($event.target as HTMLInputElement).value)"
              placeholder="请输入答案..."
            />
          </div>
        </div>
      </div>

      <div class="submit-section">
        <button
          class="btn-primary btn-large"
          :disabled="!canSubmit || isLoading"
          @click="submitReview"
        >
          {{ isLoading ? '提交中...' : '提交审核' }}
        </button>
        <p class="submit-tip">提交后将由AI自动审核，请耐心等待</p>
      </div>
    </div>

    <!-- 步骤3: 审核结果 -->
    <div v-if="currentStep === 3 && reviewResult" class="step-content result-step">
      <div class="result-card" :class="{ passed: reviewResult.passed, failed: !reviewResult.passed }">
        <div class="result-icon">
          <svg v-if="reviewResult.passed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>

        <h2 class="result-title">
          {{ reviewResult.passed ? '审核通过' : '审核未通过' }}
        </h2>

        <p class="result-reason">
          <strong>审核反馈：</strong>{{ reviewResult.reason }}
        </p>

        <div v-if="reviewResult.passed" class="result-details">
          <div class="detail-item">
            <span class="detail-label">加群验证码</span>
            <span class="detail-value code">{{ reviewResult.code }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">服务器QQ群</span>
            <span class="detail-value">{{ reviewResult.groupNumber }}</span>
          </div>
          <div class="detail-tip">
            请使用QQ搜索群号并填写验证码入群
          </div>
        </div>

        <div v-else class="result-actions">
          <button class="btn-secondary" @click="resetForm">
            重新填写
          </button>
          <a href="https://qm.qq.com/cgi-bin/qm/qr?k=1234567890" class="btn-primary" target="_blank">
            联系服主复审
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.review-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* 步骤指示器 */
.steps-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3rem;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--vp-c-gray-3);
  color: var(--vp-c-text-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: var(--vp-c-brand-3);
  color: white;
}

.step.completed .step-number {
  background: var(--vp-c-brand-2);
  color: white;
}

.step-label {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.step.active .step-label {
  color: var(--vp-c-brand-1);
  font-weight: 500;
}

.step-line {
  width: 80px;
  height: 2px;
  background: var(--vp-c-gray-3);
  margin: 0 1rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.step-line.active {
  background: var(--vp-c-brand-2);
}

/* 登录卡片 */
.login-card {
  background: var(--vp-c-bg-soft);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, #bd34fe 0%, #41d1ff 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.login-icon svg {
  width: 32px;
  height: 32px;
}

.login-header h2 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  background: linear-gradient(120deg, #bd34fe 30%, #41d1ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-header p {
  color: var(--vp-c-text-2);
  margin: 0;
}

/* 表单 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--vp-c-text-1);
}

.form-group input {
  padding: 0.875rem 1rem;
  border: 2px solid var(--vp-c-gray-3);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--vp-c-brand-2);
}

.form-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.countdown-hint {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.countdown-hint a {
  color: var(--vp-c-brand-2);
  text-decoration: none;
}

.countdown-hint a:hover {
  text-decoration: underline;
}

/* 按钮 */
.btn-primary {
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #bd34fe 0%, #41d1ff 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(189, 52, 254, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 0.875rem 1.5rem;
  background: var(--vp-c-gray-3);
  border: none;
  border-radius: 8px;
  color: var(--vp-c-text-1);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: var(--vp-c-gray-2);
}

.btn-large {
  padding: 1rem 2.5rem;
  font-size: 1.125rem;
}

/* 登录提示 */
.login-tip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--vp-c-brand-soft);
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.login-tip svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: var(--vp-c-brand-2);
}

/* 题目步骤 */
.questions-header {
  margin-bottom: 2rem;
}

.questions-header h2 {
  margin: 0 0 1rem;
  font-size: 1.5rem;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-info span {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.progress-bar {
  height: 6px;
  background: var(--vp-c-gray-3);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #bd34fe 0%, #41d1ff 100%);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* 题目卡片 */
.questions-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.question-card {
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.question-card.answered {
  border-color: var(--vp-c-brand-soft);
}

.question-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.question-number {
  font-weight: 600;
  color: var(--vp-c-brand-2);
}

.question-type {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: var(--vp-c-gray-3);
  border-radius: 4px;
  color: var(--vp-c-text-2);
}

.required-tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: var(--vp-c-danger-soft);
  border-radius: 4px;
  color: var(--vp-c-danger-2);
}

.question-content {
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

/* 选项 */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: var(--vp-c-bg);
  border: 2px solid var(--vp-c-gray-3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-item:hover {
  border-color: var(--vp-c-brand-2);
}

.option-item.selected {
  border-color: var(--vp-c-brand-2);
  background: var(--vp-c-brand-soft);
}

.option-item input {
  display: none;
}

.option-radio,
.option-checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--vp-c-gray-3);
  border-radius: 50%;
  position: relative;
  flex-shrink: 0;
  transition: all 0.2s;
}

.option-checkbox {
  border-radius: 4px;
}

.option-item.selected .option-radio {
  border-color: var(--vp-c-brand-2);
}

.option-item.selected .option-radio::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  background: var(--vp-c-brand-2);
  border-radius: 50%;
}

.option-item.selected .option-checkbox {
  border-color: var(--vp-c-brand-2);
}

.option-item.selected .option-checkbox::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  color: var(--vp-c-brand-2);
}

.option-text {
  color: var(--vp-c-text-1);
}

/* 填空题 */
.fill-input input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid var(--vp-c-gray-3);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  transition: border-color 0.2s;
}

.fill-input input:focus {
  outline: none;
  border-color: var(--vp-c-brand-2);
}

/* 提交区域 */
.submit-section {
  margin-top: 2rem;
  text-align: center;
}

.submit-tip {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

/* 结果步骤 */
.result-card {
  background: var(--vp-c-bg-soft);
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
}

.result-card.passed {
  border: 2px solid var(--vp-c-brand-soft);
}

.result-card.failed {
  border: 2px solid var(--vp-c-danger-soft);
}

.result-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-card.passed .result-icon {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-2);
}

.result-card.failed .result-icon {
  background: var(--vp-c-danger-soft);
  color: var(--vp-c-danger-2);
}

.result-icon svg {
  width: 40px;
  height: 40px;
}

.result-title {
  margin: 0 0 1rem;
  font-size: 1.75rem;
}

.result-card.passed .result-title {
  background: linear-gradient(120deg, #bd34fe 30%, #41d1ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.result-card.failed .result-title {
  color: var(--vp-c-danger-2);
}

.result-reason {
  color: var(--vp-c-text-2);
  margin: 0 0 2rem;
  line-height: 1.6;
}

.result-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--vp-c-bg);
  border-radius: 8px;
}

.detail-label {
  color: var(--vp-c-text-2);
}

.detail-value {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.detail-value.code {
  font-size: 1.5rem;
  background: linear-gradient(120deg, #bd34fe 30%, #41d1ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.detail-tip {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.result-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

/* 响应式 */
@media (max-width: 640px) {
  .steps-indicator {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .step-line {
    width: 40px;
    margin: 0 0.5rem;
  }

  .login-card,
  .question-card {
    padding: 1.5rem;
  }

  .result-actions {
    flex-direction: column;
  }
}
</style>
