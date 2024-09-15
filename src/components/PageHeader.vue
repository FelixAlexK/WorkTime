<script setup lang="ts">
import { SignedIn, SignedOut, SignInButton, UserButton } from 'vue-clerk'
import { LogIn } from 'lucide-vue-next'
import ButtonComponent from './ButtonComponent.vue';
defineProps<{ label: string }>()
defineEmits(['return'])
</script>

<template>
    <header class="not-printable">
        <div class="border-b flex flex-row p-4 w-full justify-between items-center">
            <div class="flex flex-row gap-4 items-center">
                <SignedIn>

                    <UserButton></UserButton>
                </SignedIn>
                <SignedOut>
                    <SignInButton>
                        <ButtonComponent outlined>
                            <template #prefix>
                                <LogIn class="size-4"></LogIn>
                            </template>
                        </ButtonComponent>
                    </SignInButton>
                </SignedOut>
                <h1 @click="$emit('return')" class="font-bold text-lg cursor-pointer">{{ label
                    }}</h1>
            </div>

            <div class="w-1/3 min-w-fit h-full" v-if="$slots.search">
                <slot name="search"></slot>
            </div>
            <div v-if="$slots.action" class="flex flex-row gap-2 h-full ">


                <slot name="action"></slot>

            </div>
        </div>
    </header>
</template>